#include "CFDAlgorithm.h"

// unsigned int CFDAlgorithm::fletcher16() {
//     std::string toHash = getJsonCFDs();
//     unsigned int sum1 = 0, sum2 = 0, modulus = 255;
//     for (auto ch : toHash) {
//         sum1 = (sum1 + ch) % modulus;
//         sum2 = (sum2 + sum1) % modulus;
//     }
//     return (sum2 << 8) | sum1;
// }

unsigned long long CFDAlgorithm::execute() {
    std::tie( valueDictionary, relation_ ) = PatternColumnLayoutRelationData::createFrom(inputGenerator_, is_null_equal_null_, minSupport_);
    if (relation_->getPatternColumnData().empty()) {
        throw std::runtime_error("Got an empty .csv file: CFD mining is meaningless.");
    }
    return executeInternal();
}