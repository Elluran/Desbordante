#include <algorithm>
#include <chrono>
#include <cmath>
#include <deque>
#include <map>
#include <memory>
#include <utility>

#include <boost/dynamic_bitset.hpp>

#include "ColumnLayoutRelationData.h"
#include "PatternPositionListIndex.h"
#include "Vertical.h"

namespace util {

const int PatternPositionListIndex::singletonValueId = 0;
unsigned long long PatternPositionListIndex::micros = 0;
int PatternPositionListIndex::intersectionCount = 0;

PatternPositionListIndex::PatternPositionListIndex(
        std::deque<std::vector<int>> index, unsigned int size,
        unsigned int relationSize, unsigned int originalRelationSize)
        : index(std::move(index)), size(size), relationSize(relationSize),
        originalRelationSize(originalRelationSize), probingTableCache(){}

std::map<int, std::unique_ptr<util::PatternPositionListIndex>> PatternPositionListIndex::createFor(std::vector<int>& data, bool isNullEqNull, unsigned int support) {
    std::unordered_map<int, std::vector<int>> index;
    for (unsigned long position = 0; position < data.size(); ++position){
        int valueId = data[position];
        index[valueId].push_back(position);
    }

    if (!isNullEqNull){
        index.erase(RelationData::nullValueId);
    }

    unsigned int size = 0;
    std::deque<std::vector<int>> unnamedClusters;

    for (auto& [rowNum, positions] : index){
        size += positions.size();
        unnamedClusters.emplace_back(positions);
    }

    sortClusters(unnamedClusters);
    std::map<int, std::unique_ptr<util::PatternPositionListIndex>> PLIs;
    if (size >= support) {
        PLIs.emplace(
                RelationData::unnamedValueId,
                std::make_unique<PatternPositionListIndex>(
                        std::move(unnamedClusters), size, data.size(), data.size()
                        ));

        for (auto& [rowNum, positions]: index) {
            size = positions.size();
            if (size < support) {
                continue;
            }
            auto valueId = data[positions[0]];
            PLIs.emplace(
                    valueId,
                    std::make_unique<PatternPositionListIndex>(
                            std::deque<std::vector<int>>({ std::move(positions) }),
                            size,
                            data.size(),
                            data.size()
                            ));
        }
    }
    return PLIs;
}

void PatternPositionListIndex::sortClusters(std::deque<std::vector<int>> &clusters) {
    sort(clusters.begin(),
         clusters.end(),
         [](std::vector<int> & a, std::vector<int> & b){ return a[0] < b[0]; });
}

std::shared_ptr<const std::vector<int>> PatternPositionListIndex::calculateAndGetProbingTable() const {
    if (probingTableCache != nullptr) {
        return probingTableCache;
    }

    std::vector<int> probingTable = std::vector<int>(originalRelationSize);
    int nextClusterId = singletonValueId + 1;
    for (auto & cluster : index){
        int valueId = nextClusterId++;
        for(int position : cluster){
            probingTable[position] = valueId;
        }
    }
    return std::make_shared<std::vector<int>>(probingTable);
}

std::unique_ptr<PatternPositionListIndex> PatternPositionListIndex::intersect(PatternPositionListIndex const* that) const {
    assert(this->relationSize == that->relationSize);
    return this->size > that->size
           ? that->probe(this->calculateAndGetProbingTable())
           : this->probe(that->calculateAndGetProbingTable());
}

std::unique_ptr<PatternPositionListIndex> PatternPositionListIndex::probe(std::shared_ptr<const std::vector<int>> probingTable) const {
    assert(this->relationSize == probingTable->size());
    std::deque<std::vector<int>> newIndex;
    unsigned int newSize = 0;

    std::unordered_map<int, std::vector<int>> partialIndex;

    for (auto & positions : index){
        for (int position : positions){
            if (position < 0 || position >= probingTable->size()) {
                std::cout << "position: " + std::to_string(position) +
                             ", size: " + std::to_string(probingTable->size()) << std::endl;
                for (auto pos : positions) {
                    std::cout << "Position " << pos;
                }
            }
            int probingTableValueId = (*probingTable)[position];
            if (probingTableValueId == singletonValueId) {
                continue;
            }
            intersectionCount++;
            partialIndex[probingTableValueId].push_back(position);
        }

        for (auto & iter : partialIndex){
            auto & cluster = iter.second;
            if (cluster.empty()) continue;

            newSize += cluster.size();
            newIndex.push_back(std::move(cluster));
        }
        partialIndex.clear();
    }

    sortClusters(newIndex);

    return std::make_unique<PatternPositionListIndex>(std::move(newIndex),
                                               newSize, relationSize, relationSize);
}

std::string PatternPositionListIndex::toString() const {
    std::string res = "[";
    for (auto& cluster : index){
        res.push_back('[');
        for (int v : cluster){
            res.append(std::to_string(v) + ",");
        }
        if (res.find(',') != std::string::npos)
            res.erase(res.find_last_of(','));
        res.push_back(']');
        res.push_back(',');
    }
    if (res.find(',') != std::string::npos)
        res.erase(res.find_last_of(','));
    res.push_back(']');
    return res;
}

} // namespace util

