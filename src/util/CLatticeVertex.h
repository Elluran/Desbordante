#pragma once

#include <list>
#include <utility>
#include <variant>
#include <vector>

#include <boost/dynamic_bitset.hpp>

#include "PatternColumnLayoutRelationData.h"
#include "PatternPositionListIndex.h"
#include "RelationalSchema.h"
#include "Vertical.h"
#include "TuplePattern.h"

namespace util {

class CLatticeVertex{
private:
    PatternColumnLayoutRelationData const* rel;
    TuplePattern tuplePattern;
    std::variant<std::unique_ptr<PatternPositionListIndex>, PatternPositionListIndex const*> positionListIndex_;
    std::vector<ColumnPattern const *> rhsCandidates;
    std::vector<CLatticeVertex const*> parents;

public:
    explicit CLatticeVertex(PatternColumnLayoutRelationData const* relation, TuplePattern _tuplePattern)
        : rel(relation), tuplePattern(std::move(_tuplePattern)) {}

    auto& getParents() { return parents; }
    const auto& getTuplePattern() const { return tuplePattern; }
    const auto& getColumnIndices() const { return getTuplePattern().getColumnIndices(); }

    void setRhsCandidates(std::vector<ColumnPattern const *> const& candidates) {
        rhsCandidates = candidates;
    }
    const auto& getRhsCandidates() const { return rhsCandidates; }
    auto& getRhsCandidates() { return rhsCandidates; }

    auto getSupport() const {
        return getPositionListIndex()->getSize();
    }

    auto getRhsCandidatesForColumn(unsigned colIndex) {
        std::vector<const ColumnPattern *> candidates;
        for (const auto* candidate : rhsCandidates) {
            if (candidate->getColumnIndex() == colIndex) {
                candidates.push_back(candidate);
            }
        }
        return candidates;
    }
    const auto& getPatternValues() const {
        return getTuplePattern().getPatternValues();
    }

    bool comesBeforeAndSharePrefixWith(CLatticeVertex const& that) const;

    PatternPositionListIndex const* getPositionListIndex() const;
    void setPositionListIndex(PatternPositionListIndex const* patternPositionListIndex) {
        positionListIndex_ = patternPositionListIndex;
    }
    void acquirePositionListIndex(std::unique_ptr<PatternPositionListIndex> patternPositionListIndex) {
        positionListIndex_ = std::move(patternPositionListIndex);
    }

    const auto* getColRelation() {
        return rel;
    }

    bool operator>(CLatticeVertex const& rhs) const;
    bool operator<(CLatticeVertex const& rhs) const {
        return rhs > (*this);
    }

    std::string toString() const;

    std::string toStringRhsCandidates(const std::unordered_map<int, std::string>& valueDictionary = {}) const {
        std::string res;
        for (const auto& candidate : getRhsCandidates()) {
            res += candidate->toString(valueDictionary) + ' ';
        }
        return res;
    }

    static bool comparator(CLatticeVertex * v1, CLatticeVertex * v2) {
        return *v1 < *v2;
    }

    friend std::ostream& operator<<(std::ostream& os, const CLatticeVertex& lv);

    static std::pair<bool, std::vector<ColumnPattern const *>> intersectRhsCandidates(
            std::vector<ColumnPattern const *>& lhs, std::vector<ColumnPattern const *>& rhs) {
        std::vector<ColumnPattern const *> intersection;
        auto comparator =
                [](ColumnPattern const *cp1, ColumnPattern const *cp2) {
            return cp1->isMoreGeneralThan(*cp2);
        };
        std::sort(lhs.begin(), lhs.end(), comparator);
        std::sort(rhs.begin(), rhs.end(), comparator);
        std::set_intersection(lhs.begin(), lhs.end(),
                              rhs.begin(), rhs.end(),
                              std::back_inserter(intersection));
        std::sort(intersection.begin(), intersection.end(), comparator);
        return { !intersection.empty(), std::move(intersection) };
    }

    static std::vector<int> unionPatternValues(
            std::vector<int> const& lhs, std::vector<int> const& rhs) {
        std::vector<int> res;
        assert(lhs.size() == rhs.size());
        for (size_t idx = 0; idx != lhs.size(); ++idx) {
            res.push_back(std::max(lhs[idx], rhs[idx]));
        }
        return res;
    }
};

} // namespace util

