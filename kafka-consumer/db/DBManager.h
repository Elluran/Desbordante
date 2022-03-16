#pragma once
#include <iostream>
#include <pqxx/pqxx>
#include <pqxx/nontransaction>

class DBManager{
    std::unique_ptr<pqxx::connection> connection;

public:
    DBManager(std::string pg_connection) {
        connection = std::make_unique<pqxx::connection>(pg_connection);
    }

    std::vector<pqxx::result> defaultQueries(std::vector<std::string> queries) {
        try {
            std::vector<pqxx::result> results;
            auto w = std::make_unique<pqxx::nontransaction>(*connection);
            for (const auto& query_text: queries) {
                results.push_back(w->exec(query_text));
            }
            w->commit();
            return results;
        } catch (const std::exception& e) {
            std::cerr << e.what() << std::endl;
            throw e;
        }
    }

    pqxx::result defaultQuery(std::string query_text) const {
        try {
            auto w = std::make_unique<pqxx::nontransaction>(*connection);
            pqxx::result r = w->exec(query_text);
            w->commit();
            return r;
        } catch (const std::exception& e) {
            std::cerr << e.what() << std::endl;
            throw e;
        }
    }
    
    pqxx::result transactionQuery(std::string query) const {
        try {
            auto l_work = std::make_unique<pqxx::work>(*connection);
            pqxx::result r = l_work->exec(query);
            l_work->commit();
            return r;
        } catch (const std::exception& e) {
            std::cerr << e.what() << std::endl;
            throw;
        }
    }
};