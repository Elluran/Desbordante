#pragma once
#include <algorithm>

#include <boost/dynamic_bitset.hpp>
#include <utility>

#include "PatternColumnLayoutRelationData.h"

class ColumnPattern {
    const Column* col_;
    int patternValue_;
public:
    ColumnPattern(const Column* col, int patternValue)
                  : col_(col), patternValue_(patternValue) {}

    const auto& getPatternValue() const {
        return patternValue_;
    }

    bool isConst() const {
        return patternValue_ != 0;
    }

    bool isVar() const {
        return !isConst();
    }

    std::string getColumnName() const {
        return col_->getName();
    }

    auto getColumnIndex() const {
        return col_->getIndex();
    }

    Column const* getColumn() const {
        return col_;
    }

    std::string toString(const std::unordered_map<int, std::string>& valueDictionary = {}) const {
        std::string res;
        res += "" + getColumnName();// + ",";
        res += isVar()
               ? ""
               : valueDictionary.empty()
                 ? "=" + std::to_string(getPatternValue())
                 : "=" + valueDictionary.at(getPatternValue());
        res += "";
        return res;
    }

    bool operator==(const ColumnPattern& rhs) const {
        return getColumnIndex() == rhs.getColumnIndex() && getPatternValue() == rhs.getPatternValue();
    }

    bool operator<=(const ColumnPattern& rhs) const {
        std::cout << this->toString() << " rhs " << rhs.toString() << " " << (getColumnIndex() == rhs.getColumnIndex() &&
                                                                              (getPatternValue() == rhs.getPatternValue() || !rhs.getPatternValue())) << std::endl;
        return getColumnIndex() == rhs.getColumnIndex() &&
            (getPatternValue() == rhs.getPatternValue() || !rhs.getPatternValue());
    }

    static bool lexicographicComparator(const ColumnPattern &lhs, const ColumnPattern &rhs)  {
        if (lhs.getColumnIndex() != rhs.getColumnIndex()) {
            return lhs.getColumnIndex() < rhs.getColumnIndex();
        } else {
            return lhs.getPatternValue() < rhs.getPatternValue();
        }
    }

    bool isMoreGeneralThan(const ColumnPattern& rhs) const {
        if (*col_ != *rhs.getColumn()) {
            return false;
        }
        return isVar() && rhs.isConst();
    }

    explicit operator std::string() const { return toString(); }
};

class TuplePattern {
private:
    PatternColumnLayoutRelationData const* rel;

    std::vector<int> patternValues;

    boost::dynamic_bitset<> unnamedIndices;
    boost::dynamic_bitset<> constIndices;
    boost::dynamic_bitset<> indices;

public:

    explicit TuplePattern(PatternColumnLayoutRelationData const* relation,
                          std::vector<int> constValues,
                          boost::dynamic_bitset<> indices)
            : rel(relation), patternValues(std::move(constValues)),
            unnamedIndices(indices.size()), constIndices(indices.size()),
            indices(std::move(indices))  {
        for (auto idx = this->indices.find_first(); idx != boost::dynamic_bitset<>::npos; idx = this->indices.find_next(idx)) {
            (patternValues[idx] != 0 ? constIndices : unnamedIndices).set(idx, true);
        }
        assert(isValid());
    }

    explicit TuplePattern(PatternColumnLayoutRelationData const* relation)
        : TuplePattern(relation, std::vector<int>(relation->getNumColumns()), boost::dynamic_bitset<>(relation->getNumColumns()))
    {}

    TuplePattern(TuplePattern const& other) = default;
    TuplePattern& operator=(const TuplePattern& rhs) = default;
    TuplePattern(TuplePattern&& other) = default;
    TuplePattern& operator=(TuplePattern&& rhs) = default;

    ~TuplePattern() = default;

    bool isValid() const {
        auto unionIndices = unnamedIndices | constIndices;
        return !unnamedIndices.intersects(constIndices) && (unionIndices == indices)
               && unnamedIndices.size() == constIndices.size();
    }

    const auto& getUnnamedIndices() const {
        return unnamedIndices;
    }

    auto& getUnnamedIndices() {
        return unnamedIndices;
    }

    const auto& getConstIndices() const {
        return constIndices;
    }

    auto& getConstIndices() {
        return constIndices;
    }

    const auto& getColumnIndices() const {
        return indices;
    }

    auto& getColumnIndices() {
        return indices;
    }

    std::string toString(const std::unordered_map<int, std::string>& valueDictionary = {}) const {
        std::string res = "(";
        for (auto idx = getColumnIndices().find_first(); idx != boost::dynamic_bitset<>::npos; idx = getColumnIndices().find_next(idx)) {
            res += "" + rel->getSchema()->getColumn(idx)->getName();
            res += patternValues[idx] == 0
                    ? ""
                    : (valueDictionary.empty() ? "=" + std::to_string(patternValues[idx]) : "=" + valueDictionary.at(patternValues[idx]));
            res += ", ";
        }
        res = res.substr(0, res.find_last_of(',')) + ")";
        return res;
    }

    auto size() const {
        return patternValues.size();
    }

    const auto& getPatternValues() const {
        return patternValues;
    }

    auto& getPatternValues() {
        return patternValues;
    }

    bool operator==(TuplePattern const& rhs) const {
        if (size() != rhs.size() || getColumnIndices() != rhs.getColumnIndices()) {
            return false;
        } else {
            for (auto idx = indices.find_first();
                 idx != boost::dynamic_bitset<>::npos;
                 idx = indices.find_next(idx)) {
                if (patternValues[idx] != rhs.getPatternValues()[idx]) {
                    return false;
                }
            }
            return true;
        }
    }

    bool hasColumnPattern(ColumnPattern const &rhs) const {
        auto rhsIdx = rhs.getColumnIndex();
        if (!getColumnIndices()[rhsIdx]) {
            return false;
        } else {
            return getPatternValues()[rhsIdx] == rhs.getPatternValue();
        }
    }

    bool isConst() const {
        return unnamedIndices.count() == 0;
    }

    bool isVar() const {
        return constIndices.count() == 0;
    }

    std::vector<ColumnPattern const *> getColumnPatterns() const {
        std::vector<ColumnPattern const *> colPatterns;
        for (auto idx = getColumnIndices().find_first();
             idx != boost::dynamic_bitset<>::npos;
             idx = getColumnIndices().find_next(idx)) {
            colPatterns.push_back(getAsColumnPattern(idx));
        }
        return colPatterns;
    }

    TuplePattern getWithoutColumn(unsigned int columnIndex) const {
        TuplePattern res(*this);
        assert(this->getColumnIndices()[columnIndex]);

        res.getConstIndices().set(columnIndex, false);
        res.getUnnamedIndices().set(columnIndex, false);
        res.getColumnIndices().set(columnIndex, false);
        res.getPatternValues()[columnIndex] = 0;

        return res;
    }

    bool operator<=(TuplePattern const& rhs) const {
        if (!getColumnIndices().is_subset_of(rhs.getColumnIndices())) {
            return false;
        }
        for (auto idx = getColumnIndices().find_first();
             idx != boost::dynamic_bitset<>::npos;
             idx = getColumnIndices().find_next(idx)) {
            if (getPatternValues()[idx] != rhs.getPatternValues()[idx]
                && rhs.getPatternValues()[idx]) {
                return false;
            }
        }
        return true;
    }

    bool isMoreGeneralThan(TuplePattern const& rhs) const {
        return rhs <= *this && !(*this <= rhs);
    }

    ColumnPattern* getAsColumnPattern(size_t colIndex) const {
        assert(getColumnIndices()[colIndex] != 0);
        return new ColumnPattern(rel->getSchema()->getColumn(colIndex), getPatternValues()[colIndex]);
    }

    explicit operator std::string() const { return toString(); }


};

