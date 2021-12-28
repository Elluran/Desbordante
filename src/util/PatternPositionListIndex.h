#pragma once
#include <memory>
#include <deque>
#include <vector>

#include "Column.h"
#include <iostream>
class ColumnLayoutRelationData;

namespace util {

class PatternPositionListIndex {
private:
    std::deque<std::vector<int>> index;
    unsigned int size;
    unsigned int relationSize;
    unsigned int originalRelationSize;
    std::shared_ptr<const std::vector<int>> probingTableCache;

    static void sortClusters(std::deque<std::vector<int>> & clusters);

public:
    static int intersectionCount;
    static unsigned long long micros;
    static const int singletonValueId;

    PatternPositionListIndex(std::deque<std::vector<int>> index,
                      unsigned int size, unsigned int relationSize, unsigned int originalRelationSize);

    static std::map<int, std::unique_ptr<util::PatternPositionListIndex>> createFor(
            std::vector<int>& data, bool isNullEqNull, unsigned int support);

    std::shared_ptr<const std::vector<int>> calculateAndGetProbingTable() const;
    std::vector<int> const* getCachedProbingTable() const { return probingTableCache.get(); };

    void forceCacheProbingTable() {
        probingTableCache = calculateAndGetProbingTable();
    };

    std::deque<std::vector<int>> const& getIndex() const { return index; }
    unsigned int getSize()                      const { return size; }
    unsigned int getPartitionsNumber()          const { return index.size(); }

    std::unique_ptr<PatternPositionListIndex> intersect(PatternPositionListIndex const* that) const;
    std::unique_ptr<PatternPositionListIndex> probe(std::shared_ptr<const std::vector<int>> probingTable) const;
    std::string toString() const;
};

} // namespace util

