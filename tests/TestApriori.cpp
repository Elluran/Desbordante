#include <filesystem>

#include "gtest/gtest.h"

#include "Apriori.h"
#include "Datasets.h"

namespace fs = std::filesystem;

namespace tests {

void CheckFrequentListsEquality(std::list<std::set<std::string>> const& actual,
                                std::set<std::set<std::string>> const& expected) {
    ASSERT_EQ(actual.size(), expected.size())
        << "count of frequent itemsets does not match: expected " << expected.size()
        << ", got " << actual.size();

    for (auto const& itemset : actual) {
        if (expected.find(itemset) == expected.end()) {
            FAIL() << "generated itemset not found in expected";
        }
    }
    SUCCEED();
}

void CheckAssociationRulesListsEquality(
        std::list<model::ARStrings> const& actual,
        std::set<std::pair<std::set<std::string>, std::set<std::string>>> const& expected) {
    ASSERT_EQ(actual.size(), expected.size())
        << "count of generated rules does not match: expected "
        << expected.size() << ", got " << actual.size();

    for (auto const& rule : actual) {
        std::set<std::string> lhs(rule.left.begin(), rule.left.end());
        std::set<std::string> rhs(rule.right.begin(), rule.right.end());

        if (expected.find(std::make_pair(std::move(lhs), std::move(rhs))) == expected.end()) {
            FAIL() << "generated rule does not present in expected";
        }
    }
    SUCCEED();
}

class ARAlgorithmTest : public ::testing::Test {
protected:
    static std::unique_ptr<algos::ARAlgorithm> CreateAlgorithmInstance(
            double minsup, double minconf, std::filesystem::path const& path,
            std::shared_ptr<model::InputFormat> inputFormat,
            char separator = ',', bool hasHeader = true) {
        algos::ARAlgorithm::Config const config = {path,
                                                   separator,
                                                   hasHeader,
                                                   std::move(inputFormat),
                                                   minsup,
                                                   minconf};
        return std::make_unique<algos::Apriori>(config);
    }
};

TEST_F(ARAlgorithmTest, BookDataset) {
    auto const path = fs::current_path() / "inputData" / "transactionalData" / "rules-book.csv";
    auto input_params = std::make_shared<model::Singular>(0, 1);
    auto algorithm = CreateAlgorithmInstance(0.3, 0.5, path, std::move(input_params), ',', false);
    algorithm->Execute();
    auto const actual_frequent = algorithm->GetFrequentList();
    std::set<std::set<std::string>> const expected_frequent = {{"Bread"},
                                                               {"Milk"},
                                                               {"Eggs"},
                                                               {"Cheese"},
                                                               {"Yogurt"},
                                                               {"Bread", "Milk"},
                                                               {"Eggs", "Milk"},
                                                               {"Cheese", "Milk"},
                                                               {"Eggs", "Yogurt"},
                                                               {"Milk", "Yogurt"},
                                                               {"Eggs", "Milk", "Yogurt"}};

    CheckFrequentListsEquality(actual_frequent, expected_frequent);

    auto const actual_rules = algorithm->GetArStringsList();
    std::set<std::pair<std::set<std::string>, std::set<std::string>>> expected_rules = {
        {{"Bread"}, {"Milk"}},          {{"Cheese"}, {"Milk"}},
        {{"Milk"}, {"Eggs"}},           {{"Eggs"}, {"Milk"}},
        {{"Yogurt"}, {"Eggs"}},         {{"Eggs"}, {"Yogurt"}},
        {{"Yogurt"}, {"Milk"}},         {{"Milk"}, {"Yogurt"}},
        {{"Yogurt", "Milk"}, {"Eggs"}}, {{"Yogurt", "Eggs"}, {"Milk"}},
        {{"Milk", "Eggs"}, {"Yogurt"}}, {{"Yogurt"}, {"Milk", "Eggs"}},
        {{"Eggs"}, {"Yogurt", "Milk"}}};

    CheckAssociationRulesListsEquality(actual_rules, expected_rules);
}

TEST_F(ARAlgorithmTest, PresentationExtendedDataset) {
    auto const path =
        fs::current_path() / "inputData" / "transactionalData" / "rules-presentation-extended.csv";
    auto input_params = std::make_shared<model::Singular>(0, 1);
    auto algorithm = CreateAlgorithmInstance(0.6, 0, path, std::move(input_params), ',', false);
    algorithm->Execute();
    auto const actual = algorithm->GetFrequentList();
    std::set<std::set<std::string>> const expected = {{"Bread"},
                                                      {"Milk"},
                                                      {"Diaper"},
                                                      {"Beer"},
                                                      {"Bread", "Milk"},
                                                      {"Diaper", "Beer"},
                                                      {"Beer", "Milk"},
                                                      {"Bread", "Beer"},
                                                      {"Milk", "Diaper"},
                                                      {"Bread", "Diaper"},
                                                      {"Bread", "Diaper", "Beer"},
                                                      {"Milk", "Diaper", "Beer"}};
    CheckFrequentListsEquality(actual, expected);
}

TEST_F(ARAlgorithmTest, PresentationDataset) {
    auto const path =
        fs::current_path() / "inputData" / "transactionalData" / "rules-presentation.csv";
    auto input_params = std::make_shared<model::Singular>(0, 1);
    auto algorithm = CreateAlgorithmInstance(0.6, 0, path, std::move(input_params), ',', false);
    algorithm->Execute();

    auto const actual = algorithm->GetFrequentList();
    std::set<std::set<std::string>> const expected = {
        {"Bread"},         {"Milk"},           {"Diaper"},         {"Beer"},
        {"Bread", "Milk"}, {"Diaper", "Beer"}, {"Milk", "Diaper"}, {"Bread", "Diaper"}};

    CheckFrequentListsEquality(actual, expected);

    auto const actual_rules = algorithm->GetArStringsList();
    std::set<std::pair<std::set<std::string>, std::set<std::string>>> expected_rules = {
        {{"Bread"}, {"Milk"}},   {{"Milk"}, {"Bread"}},  {{"Diaper"}, {"Beer"}},
        {{"Beer"}, {"Diaper"}},  {{"Diaper"}, {"Milk"}}, {{"Milk"}, {"Diaper"}},
        {{"Diaper"}, {"Bread"}}, {{"Bread"}, {"Diaper"}}};

    CheckAssociationRulesListsEquality(actual_rules, expected_rules);
}

TEST_F(ARAlgorithmTest, SynteticDatasetWithPruning) {
    auto const path =
        fs::current_path() / "inputData" / "transactionalData" / "rules-synthetic-2.csv";
    auto input_params = std::make_shared<model::Singular>(0, 1);
    auto algorithm =
        CreateAlgorithmInstance(0.13, 1.00001, path, std::move(input_params), ',', false);
    algorithm->Execute();

    auto const actual = algorithm->GetFrequentList();
    std::set<std::set<std::string>> const expected = {{"a"},
                                                      {"b"},
                                                      {"c"},
                                                      {"d"},
                                                      {"e"},
                                                      {"f"},
                                                      {"a", "b"},
                                                      {"a", "c"},
                                                      {"a", "d"},
                                                      {"a", "f"},
                                                      {"b", "c"},
                                                      {"c", "d"},
                                                      {"c", "f"},
                                                      {"d", "f"},
                                                      {"a", "c", "d"},
                                                      {"a", "c", "f"},
                                                      {"a", "d", "f"},
                                                      {"c", "d", "f"},
                                                      {"a", "c", "d", "f"}};

    CheckFrequentListsEquality(actual, expected);

    auto const actual_rules = algorithm->GetArStringsList();
    std::set<std::pair<std::set<std::string>, std::set<std::string>>> expected_rules = {};

    CheckAssociationRulesListsEquality(actual_rules, expected_rules);
}

TEST_F(ARAlgorithmTest, KaggleDatasetWithTIDandHeader) {
    auto const path =
        fs::current_path() / "inputData" / "transactionalData" / "rules-kaggle-rows.csv";
    auto input_params = std::make_shared<model::Tabular>(true);
    auto algorithm = CreateAlgorithmInstance(0.1, 0.5, path, std::move(input_params), ',', true);
    algorithm->Execute();

    auto const actual_frequent = algorithm->GetFrequentList();
    std::set<std::set<std::string>> const expected_frequent = {
        {"BISCUIT"},
        {"BOURNVITA"},
        {"BREAD"},
        {"COCK"},
        {"COFFEE"},
        {"CORNFLAKES"},
        {"JAM"},
        {"MAGGI"},
        {"MILK"},
        {"SUGER"},
        {"TEA"},
        {"BISCUIT", "BREAD"},
        {"COCK", "BISCUIT"},
        {"BISCUIT", "COFFEE"},
        {"CORNFLAKES", "BISCUIT"},
        {"MAGGI", "BISCUIT"},
        {"MILK", "BISCUIT"},
        {"BISCUIT", "TEA"},
        {"BREAD", "BOURNVITA"},
        {"SUGER", "BOURNVITA"},
        {"TEA", "BOURNVITA"},
        {"COFFEE", "BREAD"},
        {"JAM", "BREAD"},
        {"MAGGI", "BREAD"},
        {"MILK", "BREAD"},
        {"BREAD", "SUGER"},
        {"TEA", "BREAD"},
        {"COCK", "COFFEE"},
        {"CORNFLAKES", "COCK"},
        {"CORNFLAKES", "COFFEE"},
        {"COFFEE", "SUGER"},
        {"CORNFLAKES", "MILK"},
        {"CORNFLAKES", "TEA"},
        {"JAM", "MAGGI"},
        {"MAGGI", "TEA"},
        {"MILK", "BISCUIT", "BREAD"},
        {"COCK", "BISCUIT", "COFFEE"},
        {"CORNFLAKES", "COCK", "BISCUIT"},
        {"CORNFLAKES", "BISCUIT", "COFFEE"},
        {"MAGGI", "BISCUIT", "TEA"},
        {"TEA", "BREAD", "BOURNVITA"},
        {"BREAD", "COFFEE", "SUGER"},
        {"JAM", "MAGGI", "BREAD"},
        {"MAGGI", "TEA", "BREAD"},
        {"CORNFLAKES", "COCK", "COFFEE"},
        {"CORNFLAKES", "COCK", "BISCUIT", "COFFEE"}};

    CheckFrequentListsEquality(actual_frequent, expected_frequent);

    auto const actual_rules = algorithm->GetArStringsList();
    std::set<std::pair<std::set<std::string>, std::set<std::string>>> expected_rules = {
        {{"BISCUIT"}, {"BREAD"}},
        {{"COCK"}, {"BISCUIT"}},
        {{"CORNFLAKES"}, {"BISCUIT"}},
        {{"BOURNVITA"}, {"BREAD"}},
        {{"BOURNVITA"}, {"SUGER"}},
        {{"BOURNVITA"}, {"TEA"}},
        {{"JAM"}, {"BREAD"}},
        {{"MAGGI"}, {"BREAD"}},
        {{"MILK"}, {"BREAD"}},
        {{"SUGER"}, {"BREAD"}},
        {{"TEA"}, {"BREAD"}},
        {{"COCK"}, {"COFFEE"}},
        {{"COCK"}, {"CORNFLAKES"}},
        {{"COFFEE"}, {"CORNFLAKES"}},
        {{"CORNFLAKES"}, {"COFFEE"}},
        {{"COFFEE"}, {"SUGER"}},
        {{"SUGER"}, {"COFFEE"}},
        {{"JAM"}, {"MAGGI"}},
        {{"MAGGI"}, {"TEA"}},
        {{"TEA"}, {"MAGGI"}},
        {{"MILK", "BISCUIT"}, {"BREAD"}},
        {{"MILK", "BREAD"}, {"BISCUIT"}},
        {{"BISCUIT", "BREAD"}, {"MILK"}},
        {{"COCK", "BISCUIT"}, {"COFFEE"}},
        {{"COCK", "COFFEE"}, {"BISCUIT"}},
        {{"BISCUIT", "COFFEE"}, {"COCK"}},
        {{"COCK"}, {"BISCUIT", "COFFEE"}},
        {{"COCK", "BISCUIT"}, {"CORNFLAKES"}},
        {{"COCK", "CORNFLAKES"}, {"BISCUIT"}},
        {{"BISCUIT", "CORNFLAKES"}, {"COCK"}},
        {{"COCK"}, {"BISCUIT", "CORNFLAKES"}},
        {{"BISCUIT", "COFFEE"}, {"CORNFLAKES"}},
        {{"BISCUIT", "CORNFLAKES"}, {"COFFEE"}},
        {{"COFFEE", "CORNFLAKES"}, {"BISCUIT"}},
        {{"BISCUIT", "MAGGI"}, {"TEA"}},
        {{"BISCUIT", "TEA"}, {"MAGGI"}},
        {{"MAGGI", "TEA"}, {"BISCUIT"}},
        {{"TEA", "BREAD"}, {"BOURNVITA"}},
        {{"BOURNVITA", "BREAD"}, {"TEA"}},
        {{"TEA", "BOURNVITA"}, {"BREAD"}},
        {{"BOURNVITA"}, {"TEA", "BREAD"}},
        {{"COFFEE", "SUGER"}, {"BREAD"}},
        {{"COFFEE", "BREAD"}, {"SUGER"}},
        {{"SUGER", "BREAD"}, {"COFFEE"}},
        {{"JAM", "MAGGI"}, {"BREAD"}},
        {{"JAM", "BREAD"}, {"MAGGI"}},
        {{"MAGGI", "BREAD"}, {"JAM"}},
        {{"JAM"}, {"MAGGI", "BREAD"}},
        {{"MAGGI", "TEA"}, {"BREAD"}},
        {{"MAGGI", "BREAD"}, {"TEA"}},
        {{"TEA", "BREAD"}, {"MAGGI"}},
        {{"COCK", "COFFEE"}, {"CORNFLAKES"}},
        {{"COCK", "CORNFLAKES"}, {"COFFEE"}},
        {{"COFFEE", "CORNFLAKES"}, {"COCK"}},
        {{"COCK"}, {"COFFEE", "CORNFLAKES"}},
        {{"COCK", "BISCUIT", "COFFEE"}, {"CORNFLAKES"}},
        {{"COCK", "BISCUIT", "CORNFLAKES"}, {"COFFEE"}},
        {{"COCK", "COFFEE", "CORNFLAKES"}, {"BISCUIT"}},
        {{"BISCUIT", "COFFEE", "CORNFLAKES"}, {"COCK"}},
        {{"COCK", "BISCUIT"}, {"COFFEE", "CORNFLAKES"}},
        {{"COCK", "COFFEE"}, {"BISCUIT", "CORNFLAKES"}},
        {{"COCK", "CORNFLAKES"}, {"BISCUIT", "COFFEE"}},
        {{"BISCUIT", "COFFEE"}, {"COCK", "CORNFLAKES"}},
        {{"BISCUIT", "CORNFLAKES"}, {"COCK", "COFFEE"}},
        {{"COFFEE", "CORNFLAKES"}, {"COCK", "BISCUIT"}},
        {{"COCK"}, {"BISCUIT", "COFFEE", "CORNFLAKES"}}};

    CheckAssociationRulesListsEquality(actual_rules, expected_rules);
}

} // namespace tests
