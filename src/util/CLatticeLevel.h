#pragma once

#include <map>
#include <vector>

#include "CLatticeVertex.h"

namespace util {

class CLatticeLevel {
private:
    unsigned int arity;
    std::vector<std::unique_ptr<CLatticeVertex>> vertices;

public:
    explicit CLatticeLevel(unsigned int m_arity) : arity(m_arity) {}
    unsigned int getArity() const { return arity; }

    std::vector<std::unique_ptr<CLatticeVertex>>& getVertices() { return vertices; }

    CLatticeVertex* getLatticeVertex(const TuplePattern& _tuplePattern) const;
    // CLatticeVertex const* getLatticeVertex(const boost::dynamic_bitset<>& columnIndices,
    //                                        const TuplePattern _tuplePattern) const;
    // CLatticeVertex const* getLatticeVertex(const boost::dynamic_bitset<>& columnIndices,
    // const boost::dynamic_bitset<>& unnamedIndices, const boost::dynamic_bitset<>& constIndices,
    // int exampleTupleIdx) const;
    void add(std::unique_ptr<CLatticeVertex> vertex);

    // using vectors instead of lists because of .get()
    static void generateFirstLevel(std::vector<std::unique_ptr<CLatticeLevel>>& levels, const PatternColumnLayoutRelationData* relation);
    static void generateNextLevel(std::vector<std::unique_ptr<CLatticeLevel>>& levels);
    static void clearLevelsBelow(std::vector<std::unique_ptr<CLatticeLevel>>& levels, unsigned int arity);

    // std::vector<int> getRowNumbers() {
    //     std::vector<int> res;
    //     for (auto const& v : vertices) {
    //         res.push_back(v.get()->getRowNumber());
    //     }
    //     return res;
    // }

    // TODO
    std::string getString() {
        std::string res;
        for (const auto& v: getVertices()) {
            res += v->toString() + "\n";
        }
        return res;
    }


};

} // namespace util

