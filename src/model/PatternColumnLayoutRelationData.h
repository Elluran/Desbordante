#pragma once

#include <cmath>
#include <vector>

#include "PatternColumnData.h"
#include "CSVParser.h"
#include "RelationalSchema.h"
#include "RelationData.h"

class PatternColumnLayoutRelationData {
private:

    std::vector<std::map<int, PatternColumnData>> patternColumnData;

    std::unique_ptr<RelationalSchema> schema;
public:
    static constexpr int nullValueId = -1;

    unsigned int getNumColumns() const { return schema->getNumColumns(); }
//    double getMaximumNip() const { return getNumRows() * (getNumRows() - 1) / 2.0; }
//    unsigned long long getNumTuplePairs() const { return (unsigned long long) getNumRows() * (getNumRows() - 1) / 2; }
    RelationalSchema const* getSchema() const { return schema.get(); }

    std::vector<std::map<int, PatternColumnData>>& getPatternColumnData() { return patternColumnData; };

    std::vector<std::map<int, PatternColumnData>> const& getPatternColumnData() const { return patternColumnData; };

    std::map<int, PatternColumnData> const& getColumnPatterns(size_t columnIndex) const {
        return patternColumnData[columnIndex];
    }

//    PatternColumnData const& getColumnPattern(int columnIndex, int patternValue) const {
//        return patternColumnData[columnIndex].at(patternValue);
//    }

//    PatternColumnData const& getPatternColumnData(int columnIndex, int patternValue) const {
//        return patternColumnData[columnIndex].at(patternValue);
//    }
    unsigned int getNumRows() const { return patternColumnData[0].begin()->second.getProbingTable().size(); }

//    double getMaximumEntropy() const { return std::log(getNumRows()); }

    PatternColumnLayoutRelationData(std::unique_ptr<RelationalSchema> schema,
                             std::vector<std::map<int, PatternColumnData>> patternColumnData);

    static std::pair<std::unordered_map<int, std::string>, std::unique_ptr<PatternColumnLayoutRelationData>> createFrom(
            CSVParser& fileInput, bool isNullEqNull, unsigned  int support = 1);
    static std::pair<std::unordered_map<int, std::string>, std::unique_ptr<PatternColumnLayoutRelationData>> createFrom(
            CSVParser& fileInput, bool isNullEqNull, int maxCols, long maxRows, unsigned  int support);
};
