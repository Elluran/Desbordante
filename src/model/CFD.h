#pragma once

#include <algorithm>

#include <boost/dynamic_bitset.hpp>
#include <utility>

#include "FD.h"
#include "TuplePattern.h"

class CFD {
private:
    TuplePattern lhsPattern_;
    ColumnPattern rhsPattern_;

public:
    CFD(TuplePattern  lhsPattern, ColumnPattern const& rhsPattern)
        : lhsPattern_(std::move(lhsPattern)), rhsPattern_(rhsPattern) {}

    // TODO: Realize after merge with branch web-app
    std::string toJSONString() = delete;


    std::string toString(const std::unordered_map<int, std::string>& valueDictionary = {}) const {
        return lhsPattern_.toString(valueDictionary) + " -> " + rhsPattern_.toString(valueDictionary);
    }

    TuplePattern  const& getLhsPattern() const { return lhsPattern_; }
    ColumnPattern const& getRhsPattern() const { return rhsPattern_; }

};