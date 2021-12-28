#pragma once

#include <vector>

#include "Column.h"
#include "PatternPositionListIndex.h" // Column.h

class PatternColumnData {
private:
    Column const* column;
    std::shared_ptr<util::PatternPositionListIndex> patternPositionListIndex_;

public:
    PatternColumnData(Column const* column, std::unique_ptr<util::PatternPositionListIndex> patternPositionListIndex);

    std::vector<int> const& getProbingTable() const {
        return *patternPositionListIndex_->getCachedProbingTable();
    }
    Column const* getColumn() const { return column; }

    int getProbingTableValue(int tupleIndex) const {
        return (*patternPositionListIndex_->getCachedProbingTable())[tupleIndex];
    }
    util::PatternPositionListIndex const* getPatternPositionListIndex() const {
        return patternPositionListIndex_.get();
    }

    std::shared_ptr<util::PatternPositionListIndex> getPPLIOwnership() { return patternPositionListIndex_; }

    std::string toString() const { return "Data for " + column->toString(); }

    bool operator==(const PatternColumnData& rhs);
};
