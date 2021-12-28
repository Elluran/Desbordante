#pragma once

#include "CFD.h"
#include "FDAlgorithm.h"

#include <utility>
#include "PatternColumnLayoutRelationData.h"

namespace util {
    class AgreeSetFactory;
}

class CFDAlgorithm : public FDAlgorithm {
protected:
    std::list<CFD> cfdCollection_;
    unsigned int minSupport_;
    std::unordered_map<int, std::string> valueDictionary;
    std::unique_ptr<PatternColumnLayoutRelationData> relation_;
    unsigned long long executeInternal() override = 0;
public:
    explicit CFDAlgorithm (std::filesystem::path const& path,
                          unsigned int support = 1,
                          char separator = ',', bool hasHeader = true,
                          bool const is_null_equal_null = true,
                          std::vector<std::string_view> phase_names = { "CFD mining" })
            : FDAlgorithm(path, separator, hasHeader, is_null_equal_null,
                          std::move(phase_names)), minSupport_(support) {}

    virtual void registerCFD(TuplePattern lhsPattern, ColumnPattern rhsPattern) {
        registerCFD(CFD(std::move(lhsPattern), rhsPattern));
    }

    virtual void registerCFD(CFD cfdToRegister) {
        std::scoped_lock lock(progress_mutex_);
        cfdCollection_.push_back(std::move(cfdToRegister));
    }

    unsigned int getMinSupport() const {
        return minSupport_;
    }

    std::list<CFD> const& getCFDList() const { return cfdCollection_; }

    auto getCFDListString() const {
        std::vector<std::string> result;
        for (const auto& cfd : getCFDList()) {
            result.push_back(cfd.toString(valueDictionary));
        }
        return result;
    }

    std::string getStringCFDs() const {
        std::string result;
        auto discoveredCFDs = getCFDListString();
        std::sort(discoveredCFDs.begin(), discoveredCFDs.end(), std::less<>());
        for (const auto& cfd : discoveredCFDs) {
            result += cfd + '\n';
        }
        return result;
    }

    virtual void printCFDList() const {
        std::cout << getStringCFDs();
    };

    // TODO: Realize after merge with branch web-app
    std::string getJsonCFDs() const = delete;

    const auto& getValueDictionary() const {
        return valueDictionary;
    }

    unsigned int fletcher16() final {
        std::string toHash = getStringCFDs();
        unsigned int sum1 = 0, sum2 = 0, modulus = 255;
        for (auto ch : toHash) {
            sum1 = (sum1 + ch) % modulus;
            sum2 = (sum2 + sum1) % modulus;
        }
        return (sum2 << 8) | sum1;
    };

    ~CFDAlgorithm() override = default;

    PatternColumnLayoutRelationData const& getRelation() const {
        assert(relation_ != nullptr);
        return *relation_;
    }

    unsigned long long execute() override;
};
