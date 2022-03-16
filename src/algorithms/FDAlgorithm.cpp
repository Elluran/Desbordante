#include "FDAlgorithm.h"

#include <thread>

//std::vector<size_t> FDAlgorithm::getPKColumnPositions(CSVParser inputGenerator) {
//    std::vector<size_t> positions;
//    auto relation_ = ColumnLayoutRelationData::CreateFrom(inputGenerator, true);
//    for (auto const& col : relation_->getColumnData()) {
//        if (col.getPositionListIndex()->getNumNonSingletonCluster() == 0) {
//            positions.push_back(col.getColumn()->getIndex());
//        }
//    }
//    return positions;
//}

//std::string FDAlgorithm::getJsonFDs(bool withNullLhs) {
//    nlohmann::json j = nlohmann::json::array();
//    std::cout << "FDs " << fdCollection_.size() << std::endl;
//    fdCollection_.sort();
//    for (auto& fd : fdCollection_) {
//        if (withNullLhs) {
//            j.push_back(fd.toJSON());
//        } else {
//            if (fd.getLhs().getArity() != 0) {
//                j.push_back(fd.toJSON());
//            }
//        }
//    }
//    return j.dump();
//}

//std::string FDAlgorithm::getPieChartData(int degree) {
//    size_t numberOfColumns = inputGenerator_.getNumberOfColumns();
//
//    std::vector<double> LhsValues(numberOfColumns, 0);
//    std::vector<double> RhsValues(numberOfColumns, 0);
//
//    for (const auto &fd : fdCollection_) {
//        double divisor = std::pow(fd.getLhs().getArity(), degree);
//
//        const auto &LhsColumnIndices = fd.getLhs().getColumnIndices();
//        for (size_t index = LhsColumnIndices.find_first();
//            index != boost::dynamic_bitset<>::npos;
//            index = LhsColumnIndices.find_next(index)) {
//                LhsValues[index] += 1 / divisor;
//        }
//        size_t index = fd.getRhs().getIndex();
//
//        RhsValues[index] = (divisor == 0)
//                ? -1
//                : RhsValues[index] + 1 / divisor;
//
//    }
//
//    nlohmann::json j;
//    std::vector<std::pair<nlohmann::json, nlohmann::json>> lhs_array;
//    std::vector<std::pair<nlohmann::json, nlohmann::json>> rhs_array;
//
//    for (size_t i = 0; i != numberOfColumns; ++i) {
//        lhs_array.push_back({ { "idx", i }, { "value", LhsValues[i] } });
//        rhs_array.push_back({ { "idx", i }, { "value", RhsValues[i] } });
//    }
//
//    j["lhs"] = lhs_array;
//    j["rhs"] = rhs_array;
//
//    return j.dump();
//}

unsigned long long FDAlgorithm::Execute() {
    Initialize();

    return ExecuteInternal();
}

void FDAlgorithm::InitConfigParallelism() {
    if (config_.parallelism == 0) {
        config_.parallelism = std::thread::hardware_concurrency();
        if (config_.parallelism == 0) {
            throw std::runtime_error("Unable to detect number of concurrent "
                                     "threads supported by your system. "
                                     "Please, specify it manually.");
        }
    }
}

std::string FDAlgorithm::GetJsonFDs() const {
        return FDsToJson(fd_collection_);
}

unsigned int FDAlgorithm::Fletcher16() {
    std::string to_hash = GetJsonFDs();
    unsigned int sum1 = 0, sum2 = 0, modulus = 255;
    for (auto ch : to_hash) {
        sum1 = (sum1 + ch) % modulus;
        sum2 = (sum2 + sum1) % modulus;
    }
    return (sum2 << 8) | sum1;
}

/* Attribute A contains only unique values (i.e. A is the key) iff [A]->[B]
 * holds for every attribute B. So to determine if A is a key, we count
 * number of fds with lhs==[A] and if it equals the total number of attributes
 * minus one (the attribute A itself) then A is the key.
 */
std::vector<Column const*> FDAlgorithm::GetKeys() const {
    std::vector<Column const*> keys;
    std::map<Column const*, size_t> fds_count_per_col;
    unsigned int cols_of_equal_values = 0;
    size_t const number_of_cols = input_generator_.GetNumberOfColumns();

    for (FD const& fd : fd_collection_) {
        Vertical const& lhs = fd.GetLhs();

        if (lhs.GetArity() == 0) {
            /* We separately count columns consisting of only equal values,
             * because they cannot be on the right side of the minimal fd.
             * And obviously for every attribute A true: [A]->[B] holds
             * if []->[B] holds.
             */
            cols_of_equal_values++;
        } else if (lhs.GetArity() == 1) {
            fds_count_per_col[lhs.GetColumns().front()]++;
        }
    }

    for (auto const&[col, num] : fds_count_per_col) {
        if (num + 1 + cols_of_equal_values == number_of_cols) {
            keys.push_back(col);
        }
    }

    return keys;
}