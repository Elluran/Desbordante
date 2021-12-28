#include "PatternColumnData.h"

#include <utility>


PatternColumnData::PatternColumnData(Column const* column,
    std::unique_ptr<util::PatternPositionListIndex> patternPositionListIndex)
        : column(column), patternPositionListIndex_(std::move(patternPositionListIndex)) {
    patternPositionListIndex_->forceCacheProbingTable();
}

bool PatternColumnData::operator==(const PatternColumnData &rhs) {
    if (this == &rhs) return true;
    return this->column == rhs.column;
}