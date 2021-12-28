#pragma once

#include <string>

#include "CSVParser.h"
#include "CFDAlgorithm.h"
#include "PositionListIndex.h"
#include "RelationData.h"
#include "CLatticeVertex.h"
#include "CLatticeLevel.h"

class CTane : public CFDAlgorithm {
private:
    unsigned long long executeInternal() final;
    double minConfidence_;
public:
    const unsigned int maxArity = -1;

    int countOfCFD = 0;
    long aprioriMillis = 0;

    explicit CTane(std::filesystem::path const& path, char separator = ',', bool hasHeader = true,
            unsigned int maxArity = -1, unsigned int minSupport = 1, double minConfidence = 1)
            : CFDAlgorithm(path, minSupport, separator, hasHeader), minConfidence_(minConfidence),
            maxArity(maxArity) {}

    double getMinConfidence() const {
        return minConfidence_;
    }

    std::vector<const ColumnPattern*> intersectCandidates(std::vector<const ColumnPattern*>&, std::vector<const ColumnPattern*>&);
    bool isExactCFD(util::CLatticeVertex const& xVertex, util::CLatticeVertex const& xaVertex) const;
    double calculatePartitionError(const util::PatternPositionListIndex &xPLI, const util::PatternPositionListIndex &xaPLI) const;
    double calculateConfidence(const util::CLatticeVertex &xVertex, const util::CLatticeVertex &xaVertex) const;
    double calculateConstConfidence(util::CLatticeVertex const& xVertex, util::CLatticeVertex const& xaVertex) const;
    void registerCFD(const TuplePattern& lhsPattern, const ColumnPattern& rhsPattern, unsigned supp, double conf);
    void pruneCandidates(util::CLatticeLevel* level, util::CLatticeVertex const* xVertex,
                         util::CLatticeVertex const* xaVertex, ColumnPattern const& rhsColumnPattern) const;
    void prune(util::CLatticeLevel* level);

    void printCFDList() const final;

};
