#include "CLatticeVertex.h"

namespace util {

using boost::dynamic_bitset;

bool CLatticeVertex::comesBeforeAndSharePrefixWith(CLatticeVertex const& rhs) const {
    const auto &indices = getColumnIndices();
    const auto &rhsIndices = rhs.getColumnIndices();

    auto index = indices.find_first();
    auto rhsIndex = rhsIndices.find_first();

    auto arity = indices.count();
    for (unsigned long i = 0; i < arity - 1; i++){
        if (index != rhsIndex ||
            getPatternValues()[index] != rhs.getPatternValues()[rhsIndex]) {
            return false;
        }
        index = indices.find_next(index);
        rhsIndex = rhsIndices.find_next(rhsIndex);
    }
    return index < rhsIndex;
}

bool CLatticeVertex::operator>(CLatticeVertex const& rhs) const {
    if (getColumnIndices().count() != rhs.getColumnIndices().count()) {
        return getColumnIndices().count() > rhs.getColumnIndices().count();
    }

    const auto& indices = getColumnIndices();
    const auto& rhsIndices = rhs.getColumnIndices();

    for (auto [idx, rhsIdx ] = std::pair(indices.find_first(), rhsIndices.find_first());
         idx != dynamic_bitset<>::npos || rhsIdx != dynamic_bitset<>::npos;
         std::tie(idx, rhsIdx) = std::pair(indices.find_next(idx),
                                           rhsIndices.find_next(rhsIdx))) {
        auto result = (long)idx - (long)rhsIdx;
        if (result) {
            return (result > 0);
        }
    }

    return rhs.getTuplePattern().isMoreGeneralThan(getTuplePattern());
}

std::string CLatticeVertex::toString() const {
    std::stringstream buffer;
    buffer << (*this);
    return buffer.str();
}

std::ostream& operator<<(std::ostream& os, const CLatticeVertex& vertex) {
    os << "Pattern" << vertex.getTuplePattern().toString() << std::endl;
    os << "Rhs Candidates: " << vertex.toStringRhsCandidates() << std::endl;
    return os;
}

PatternPositionListIndex const *CLatticeVertex::getPositionListIndex() const {
    if (std::holds_alternative<std::unique_ptr<PatternPositionListIndex>>(positionListIndex_)) {
        return std::get<std::unique_ptr<PatternPositionListIndex>>(positionListIndex_).get();
    } else {
        return std::get<PatternPositionListIndex const *>(positionListIndex_);
    }
}

} // namespace util