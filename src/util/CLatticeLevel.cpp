#include <algorithm>
#include <chrono>
#include <iostream>

#include "ColumnCombination.h"
#include "CLatticeLevel.h"

namespace util {

using std::move, std::min, std::shared_ptr, std::vector, std::cout, std::endl, std::sort, std::make_shared;

void CLatticeLevel::add(std::unique_ptr<CLatticeVertex> vertex) {
    vertices.emplace_back(std::move(vertex));
}

CLatticeVertex* CLatticeLevel::getLatticeVertex(const TuplePattern& _tuplePattern) const {
    if (vertices.empty()) {
        return nullptr;
    }
    auto it =
            std::find_if(vertices.begin(), vertices.end(),
                         [&](const std::unique_ptr<CLatticeVertex> &vertex){
                return vertex->getTuplePattern() == _tuplePattern;
            });
    return it == vertices.end() ? nullptr : it.base()->get();
}

void CLatticeLevel::generateFirstLevel(std::vector<std::unique_ptr<util::CLatticeLevel>>& levels, const PatternColumnLayoutRelationData* relation) {
        auto level = std::make_unique<util::CLatticeLevel>(1);
        auto const* emptyVertex = new util::CLatticeVertex(
                relation, TuplePattern(relation)
        );
        auto colNumbers = relation->getNumColumns();
        std::vector<ColumnPattern const *> rhsCandidates;

        for (auto const& rhsColumnPatterns : relation->getPatternColumnData()) {
            for (const auto& [rhsPatternValue, patternColumnData] : rhsColumnPatterns) {
                rhsCandidates.emplace_back(new ColumnPattern(patternColumnData.getColumn(), rhsPatternValue));
            }
        }

        for (size_t colIndex = 0; colIndex != colNumbers; ++colIndex) {
            const auto& columnPatterns = relation->getColumnPatterns(colIndex);
            auto indices = boost::dynamic_bitset<>(colNumbers).set(colIndex);
            for (const auto& [patternValue, columnPatternData] : columnPatterns) {
                const auto* ppli = columnPatternData.getPatternPositionListIndex();
                std::vector<int> patternValues(colNumbers);
                patternValues[colIndex] = patternValue;
                auto vertex =
                        std::make_unique<util::CLatticeVertex>(
                                relation,
                                TuplePattern(relation, std::move(patternValues), indices)
                        );
                vertex->setPositionListIndex(ppli);
                vertex->getParents().push_back(emptyVertex);

                auto columnRhsCandidates = rhsCandidates;
                columnRhsCandidates.erase(
                        std::remove_if(columnRhsCandidates.begin(), columnRhsCandidates.end(),
                                       [&colIndex, &vertex](ColumnPattern const * candidate) {
                                           return candidate->getColumnIndex() == colIndex
                                                  && candidate->getPatternValue() != vertex->getPatternValues()[colIndex];
                                       }),
                        columnRhsCandidates.end());
                vertex->setRhsCandidates(columnRhsCandidates);
                level->add(std::move(vertex));
            }
        }
        levels.push_back(std::move(level));
    }

void CLatticeLevel::generateNextLevel(std::vector<std::unique_ptr<CLatticeLevel>>& levels) {
    unsigned int currentLevelIndex = levels.size() - 1;
    assert(currentLevelIndex >= 0);
    std::cout << "-------------Creating level " << currentLevelIndex + 2 << "...-----------------\n";

    auto* currentLevel = levels[currentLevelIndex].get();

    std::vector<CLatticeVertex *> currentLevelVertices;
    for (const auto& vertex : currentLevel->getVertices()) {
        currentLevelVertices.push_back(vertex.get());
    }

    std::sort(currentLevelVertices.begin(), currentLevelVertices.end(), CLatticeVertex::comparator);

    auto nextLevel = std::make_unique<CLatticeLevel>(currentLevelIndex + 1);
    for (unsigned int vertexIndex1 = 0; vertexIndex1 < currentLevelVertices.size(); vertexIndex1++){
        auto* vertex1 = currentLevelVertices[vertexIndex1];
        if (vertex1->getRhsCandidates().empty()) {
            continue;
        }

        for (unsigned int vertexIndex2 = vertexIndex1 + 1; vertexIndex2 < currentLevelVertices.size(); vertexIndex2++) {
            auto* vertex2 = currentLevelVertices[vertexIndex2];
            if (!vertex1->comesBeforeAndSharePrefixWith(*vertex2)) {
                continue;
            }
            auto [isIntersects, rhsCandidatesIntersection] =
                    CLatticeVertex::intersectRhsCandidates(vertex1->getRhsCandidates(),
                                                           vertex2->getRhsCandidates());
            if (!isIntersects) {
                continue;
            }
            std::unique_ptr<CLatticeVertex> childVertex = std::make_unique<CLatticeVertex>(
                    vertex1->getColRelation(),
                    TuplePattern(
                            vertex1->getColRelation(),
                            CLatticeVertex::unionPatternValues(
                                    vertex1->getTuplePattern().getPatternValues(),
                                    vertex2->getTuplePattern().getPatternValues()),
                                    vertex1->getColumnIndices() | vertex2->getColumnIndices())
                                    );
            auto& childRhsCandidates = childVertex->getRhsCandidates();

            dynamic_bitset<> parentIndices = vertex1->getTuplePattern().getColumnIndices()
                                             | vertex2->getTuplePattern().getColumnIndices();
            childRhsCandidates = std::move(rhsCandidatesIntersection);
            for (unsigned int i = 0, skipIndex = parentIndices.find_first(); i < currentLevelIndex;
                 i++, skipIndex = parentIndices.find_next(skipIndex)) {
                auto* parentVertex = currentLevel->getLatticeVertex(
                        childVertex->getTuplePattern().getWithoutColumn(skipIndex));

                if (parentVertex == nullptr) {
                    goto continueMidOuter;
                }
                std::tie(isIntersects,childRhsCandidates) =
                        CLatticeVertex::intersectRhsCandidates(
                                childRhsCandidates,
                                parentVertex->getRhsCandidates());
                if (!isIntersects) {
                    goto continueMidOuter;
                }
                childVertex->getParents().push_back(parentVertex);
            }

            childVertex->getParents().push_back(vertex1);
            childVertex->getParents().push_back(vertex2);

            if (!childRhsCandidates.empty()) {
                nextLevel->add(std::move(childVertex));
            }

            continueMidOuter:
            continue;
        }
    }
    levels.push_back(std::move(nextLevel));
}

void CLatticeLevel::clearLevelsBelow(std::vector<std::unique_ptr<CLatticeLevel>>& levels, unsigned int arity) {
     // Clear the levels from the level list
     auto it = levels.begin();

     for (unsigned int i = 0; i < std::min((unsigned int)levels.size(), arity); i++) {
         (*(it++))->getVertices().clear();
     }

     // Clear child references
     if (arity < levels.size()) {
         for (auto& retainedVertex : levels[arity]->getVertices()){
             retainedVertex->getParents().clear();
         }
     }
}

} // namespace util

