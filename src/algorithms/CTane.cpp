#include "CTane.h"

#include <chrono>
#include <iostream>
#include <list>
#include <memory>

#include "RelationalSchema.h"
#include "CLatticeLevel.h"
#include "CLatticeVertex.h"

using namespace util;

bool CTane::isExactCFD(const CLatticeVertex &xVertex, const CLatticeVertex &xaVertex) const {
    return xVertex.getPositionListIndex()->getPartitionsNumber() == xaVertex.getPositionListIndex()->getPartitionsNumber()
           && xVertex.getPositionListIndex()->getSize() == xaVertex.getPositionListIndex()->getSize();
}

double CTane::calculateConstConfidence(const CLatticeVertex &xVertex, const CLatticeVertex &xaVertex) const {
    return (double)xaVertex.getSupport()/xVertex.getSupport();
}

double CTane::calculateConfidence(const CLatticeVertex &xVertex, const CLatticeVertex &xaVertex) const {
    auto errorSum = calculatePartitionError(*xVertex.getPositionListIndex(), *xaVertex.getPositionListIndex());
    return 1 - (double)errorSum/xVertex.getSupport();
}

double CTane::calculatePartitionError(const PatternPositionListIndex &xPLI, const PatternPositionListIndex &xaPLI) const {
    int errorSum = 0;
    std::map<int, unsigned int> partitionsSize;
    for (const auto& cluster : xaPLI.getIndex()) {
        partitionsSize[cluster[cluster.size() - 1]] = cluster.size();
    }
    unsigned int maxCount = 0;
    int count = 0;

    for (const auto& cluster : xPLI.getIndex()) {
        for (int rowNumber : cluster) {
            count++;
            if (partitionsSize.count(rowNumber) && partitionsSize[rowNumber] > maxCount) {
                maxCount = partitionsSize[rowNumber];
            }
        }
        errorSum += count - (int)maxCount;
        maxCount = 0;
        count = 0;
    }

    return errorSum;
}

std::vector<const ColumnPattern*> CTane::intersectCandidates(
        std::vector<const ColumnPattern*>& xaRhsCandidates,
        std::vector<const ColumnPattern*>& xaColumnPatterns) {
    std::vector<const ColumnPattern *> intersection;
    std::set_intersection(
            xaRhsCandidates.begin(), xaRhsCandidates.end(),
            xaColumnPatterns.begin(), xaColumnPatterns.end(),
            std::back_inserter(intersection),
            [](const ColumnPattern* lhs, const ColumnPattern* rhs) {
                return ColumnPattern::lexicographicComparator(*lhs,*rhs);
            });
    return intersection;
}

void CTane::registerCFD(const TuplePattern& lhsPattern, const ColumnPattern& rhsPattern, unsigned supp, double conf) {
    CFD cfd(lhsPattern, rhsPattern);
    std::cout << "Discovered CFD: " << cfd.toString(getValueDictionary())
              << " with support = " << supp << " and confidence = " << conf << "." << std::endl;
    CFDAlgorithm::registerCFD(std::move(cfd));
    countOfCFD++;
}

void CTane::printCFDList() const {
    std::cout << "Total CFD count : " << countOfCFD << std::endl;
    CFDAlgorithm::printCFDList();
}

void CTane::pruneCandidates(CLatticeLevel *level, const CLatticeVertex *xVertex,
                            const CLatticeVertex *xaVertex, ColumnPattern const& rhsColumnPattern) const {
    // otherIndices = { idx : idx in R\X }
    auto otherIndices =
            ~boost::dynamic_bitset<>(getRelation().getNumColumns())
            -xVertex->getColumnIndices();

    auto rhsColIndex = rhsColumnPattern.getColumnIndex();
    auto xaVertexWithoutCol =
            xaVertex->getTuplePattern().getWithoutColumn(rhsColIndex);

    for (const auto &vertex : level->getVertices()) {
        const auto& tuplePattern = vertex->getTuplePattern();
        auto& candidates = vertex->getRhsCandidates();
        if (tuplePattern.hasColumnPattern(rhsColumnPattern)
            && xaVertexWithoutCol <= tuplePattern.getWithoutColumn(rhsColIndex)) {
            candidates.erase(
                    std::remove_if(
                            candidates.begin(), candidates.end(),
                            [&otherIndices, &rhsColumnPattern]
                            (const ColumnPattern *colPattern) {
                                return *colPattern == rhsColumnPattern
                                || otherIndices[colPattern->getColumnIndex()];
                            }),
                    vertex->getRhsCandidates().end());
        }
    }
}

void CTane::prune(CLatticeLevel* level) {
    auto& levelVertices = level->getVertices();
    levelVertices.erase(
            std::remove_if(
                    levelVertices.begin(),
                    levelVertices.end(),
                    [&](std::unique_ptr<CLatticeVertex> & vertex) {
                        return vertex->getRhsCandidates().empty() || (vertex->getPositionListIndex()->getSize() < getMinSupport());
                    }),
            levelVertices.end());
}

unsigned long long CTane::executeInternal() {
    double progressStep = 100.0 / std::min(maxArity, getRelation().getNumColumns());
    auto startTime = std::chrono::system_clock::now();

    std::vector<std::unique_ptr<CLatticeLevel>> levels;

    for (unsigned int arity = 0; arity < maxArity; arity++) {
        if (arity == 0) {
            CLatticeLevel::generateFirstLevel(levels, &getRelation());
        } else {
            CLatticeLevel::generateNextLevel(levels);
        }

        auto* level = levels[arity].get();
        std::cout << "Checking " << level->getVertices().size() << " "
                  << arity << "-ary lattice vertices." << std::endl;
        if (level->getVertices().empty()) {
            break;
        }
        for (auto& xaVertex: level->getVertices()) {
            if (!xaVertex->getPositionListIndex()) {
                auto parentPLI1 = xaVertex->getParents()[0]->getPositionListIndex();
                auto parentPLI2 = xaVertex->getParents()[1]->getPositionListIndex();
                xaVertex->acquirePositionListIndex(parentPLI1->intersect(parentPLI2));
                if (xaVertex->getPositionListIndex()->getSize() < getMinSupport()) {
                    continue;
                }
            }

            for (const auto xVertex: xaVertex->getParents()) {
                auto aIndex = (xaVertex->getColumnIndices() - xVertex->getColumnIndices()).find_first();
                auto xaColumnPatterns = xaVertex->getRhsCandidatesForColumn(aIndex);

                const auto rhsCandidates = intersectCandidates(
                        xaVertex->getRhsCandidates(), xaColumnPatterns);
                for (const auto* rhsColumnPattern: rhsCandidates) {
                    // Discard CFD const -> var, var -> const
                    if ((xVertex->getTuplePattern().isConst() && rhsColumnPattern->isVar())
                        || (xVertex->getTuplePattern().isVar() && rhsColumnPattern->isConst())) {
                        continue;
                    }

                    double conf = getMinConfidence() == 1
                            ? isExactCFD(*xVertex, *xaVertex)
                            : rhsColumnPattern->isConst()
                              ? calculateConstConfidence(*xVertex, *xaVertex)
                              : calculateConfidence(*xVertex, *xaVertex);

                    if (conf >= getMinConfidence()) {
                        registerCFD(xVertex->getTuplePattern(), *rhsColumnPattern,
                                    xaVertex->getSupport(), conf);
                    }
                    if (conf == 1) {
                        pruneCandidates(level, xVertex, xaVertex.get(), *rhsColumnPattern);
                    }
                }
            }
        }
        prune(level);
        addProgress(progressStep);
    }

    setProgress(100);

    auto elapsed_milliseconds = std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::system_clock::now() - startTime);
    aprioriMillis += elapsed_milliseconds.count();
    printCFDList();
    return aprioriMillis;
}
