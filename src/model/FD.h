#pragma once

#include <string>

#include "Column.h"
#include "Vertical.h"

class FD {
private:
    Vertical lhs_;
    Column rhs_;

public:
    FD(Vertical const& lhs, Column const& rhs) : lhs_(lhs), rhs_(rhs) {}

    std::string toJSONString() const {
        std::string lhs;
        for (auto col : lhs_.getColumns()) {
            lhs += col->getName() + ' ';
        }
        return "{lhs: " + lhs + ", rhs: " + rhs_.getName() + "}";
    }

    virtual std::string toString() const {
        return "[" + lhs_.toIndicesString() + "] -> " + rhs_.toIndicesString();
    }

    Vertical const& getLhs() const { return lhs_; }
    Column const& getRhs() const { return rhs_; }

    // unsigned int fletcher16() const;
};