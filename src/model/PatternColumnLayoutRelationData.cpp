
#include <map>
#include <memory>
#include <utility>

#include "PatternColumnLayoutRelationData.h"
#include "easylogging++.h"


PatternColumnLayoutRelationData::PatternColumnLayoutRelationData(std::unique_ptr<RelationalSchema> schema,
                                                   std::vector<std::map<int, PatternColumnData>> patternColumnData)
        : patternColumnData(std::move(patternColumnData)), schema(std::move(schema)) {}


//PatternColumnData& PatternColumnLayoutRelationData::getPatternColumnData(int columnIndex, int patternValue) {
//    return patternColumnData[columnIndex].at(patternValue);
//}


std::pair<std::unordered_map<int, std::string>, std::unique_ptr<PatternColumnLayoutRelationData>> PatternColumnLayoutRelationData::createFrom(CSVParser &fileInput, bool isNullEqNull, unsigned int support) {
    return createFrom(fileInput, isNullEqNull, -1, -1, support);
}

std::pair<std::unordered_map<int, std::string>, std::unique_ptr<PatternColumnLayoutRelationData>> PatternColumnLayoutRelationData::createFrom(
        CSVParser &fileInput, bool isNullEqNull, int maxCols, long maxRows, unsigned int support) {
    auto schema = std::make_unique<RelationalSchema>(fileInput.getRelationName(), isNullEqNull);
    std::unordered_map<std::string, int> valueDictionary;
    int nextValueId = 1;
    const int nullValueId = -1;
    int numColumns = fileInput.getNumberOfColumns();
    if (maxCols > 0) numColumns = std::min(numColumns, maxCols);
    std::vector<std::vector<int>> columnVectors = std::vector<std::vector<int>>(numColumns);
    int rowNum = 0;
    std::vector<std::string> row;

    while (fileInput.getHasNext()){
        row = fileInput.parseNext();

        if (row.empty() && numColumns == 1) {
            row.emplace_back("");
        } else if ((int)row.size() != numColumns) {
            LOG(WARNING) << "Skipping incomplete rows";
            continue;
        }

        if (maxRows <= 0 || rowNum < maxRows){
            int index = 0;
            for (std::string& field : row){
                if (field.empty()){
                    columnVectors[index].push_back(nullValueId);
                } else {
                    auto location = valueDictionary.find(field);
                    int valueId;
                    if (location == valueDictionary.end()){
                        valueDictionary[field] = nextValueId;
                        valueId = nextValueId;
                        nextValueId++;
                    } else {
                        valueId = location->second;
                    }
                    columnVectors[index].push_back(valueId);
                }
                index++;
                if (index >= numColumns) break;
            }
        } else {
            //TODO: Подумать что тут сделать
            assert(0);
        }
        rowNum++;
    }

    std::vector<std::map<int, PatternColumnData>> patternColumnData;
    for (int i = 0; i < numColumns; ++i) {
        auto column = Column(schema.get(), fileInput.getColumnName(i), i);
        schema->appendColumn(std::move(column));
        auto columnPPLIs = util::PatternPositionListIndex::createFor(columnVectors[i], schema->isNullEqualNull(), support);
        std::map<int, PatternColumnData> columnPatterns;
        for (auto& [key, patternPositionListIndex] : columnPPLIs) {
            columnPatterns.emplace(key, PatternColumnData(schema->getColumn(i), std::move(patternPositionListIndex)));
        }
        patternColumnData.emplace_back(std::move(columnPatterns));
    }

    std::unordered_map<int, std::string> reverseValueDictionary;
    for (auto& [key, value] : valueDictionary) {
        reverseValueDictionary.emplace(value, key);
    }
    schema->init();

    return { reverseValueDictionary, std::make_unique<PatternColumnLayoutRelationData>(std::move(schema), std::move(patternColumnData)) };
}
