#pragma once
#include <string>
#include <algorithm>
#include <filesystem>

#include "DBManager.h"
#include <boost/algorithm/string.hpp>
#include <boost/program_options.hpp>

using variable_value = boost::program_options::variable_value;
using variables_map = boost::program_options::variables_map;

class TaskConfig {
private:

    std::string const task_id_;
    std::string const algo_;
    std::string const type_; // "FD", "CFD", "AR",

    variables_map params_intersection_;

    static std::string task_info_table;
    static std::string file_info_table;
    static std::string task_config_table;

    explicit TaskConfig(std::string task_id, std::string type, std::string algo_name,
               double error_percent, char separator,
               std::filesystem::path dataset_path, bool has_header,
               unsigned int max_lhs, ushort threads)
        :   task_id_(task_id), algo_(algo_name), type_(type) {
        params_intersection_.emplace("data", variable_value(dataset_path, false));
        params_intersection_.emplace("separator", variable_value(separator, false));
        params_intersection_.emplace("has_header", variable_value(has_header, false));
        params_intersection_.emplace("is_null_equal_null", variable_value(true, false));
        params_intersection_.emplace("max_lhs", variable_value(max_lhs, false));
        params_intersection_.emplace("threads", variable_value(threads, false));
        params_intersection_.emplace("error", variable_value(error_percent, false));
        params_intersection_.emplace("seed", variable_value(0, false));
    }

    static std::string GetSpecificResultTableName(const TaskConfig& config) {
        return "\"" + config.GetType() + "TasksResult\"";
    }

    static std::string GetSpecificConfigTableName(const TaskConfig& config) {
        return "\"" + config.GetType() + "TasksConfig\"";
    }

    static void PrepareString(std::string& str) {
        for(
            auto pos = std::find(str.begin(), str.end(), '\'');
            pos != str.end();
            pos = std::find(pos, str.end(), '\'')
        ) {
            pos = str.insert(pos + 1, '\'');
            pos++;
        }
    }

    void SendUpdateQuery(DBManager const &manager, std::string table_name,
                         std::map<std::string, std::string> values,
                         std::string query_description) const {
        std::vector<std::string> set_attributes;
        for (auto& [key, value]: values) {
            set_attributes.emplace_back('\"' + key + '\"' + "='" + value + '\'');
        }
        std::string expression = boost::join(set_attributes, ",");
        std::string query = "UPDATE " + table_name + " SET " + expression
                            + " WHERE \"taskID\" = '" + task_id_ + "'";
        try {
            manager.TransactionQuery(query);
        } catch(const std::exception& e) {
            std::cerr << "Unexpected exception executing query [" << query_description << "], "
                      << "Info for debug = [" << expression << "] \n"
                      << "caught: " << e.what() << std::endl;
            throw e;
        }
    }

    void UpdateTaskState(DBManager const &manager, std::map<std::string, std::string> values) const {
        SendUpdateQuery(manager, task_info_table, values, "Updating task state");
    }

    void UpdateTaskResult(DBManager const &manager, std::map<std::string, std::string> values) const {
        SendUpdateQuery(manager, GetSpecificResultTableName(*this), values,
                        "Updating task specific result");
    }

    void UpdateTaskConfig(DBManager const &manager, std::map<std::string, std::string> values) const {
        SendUpdateQuery(manager, GetSpecificConfigTableName(*this), values,
                        "Updating task specific result");
    }

public:

    static TaskConfig GetTaskConfig(DBManager const &manager, std::string task_id) {
        std::string postfix = " WHERE \"taskID\" = '" + task_id + "'";
        std::string query = "SELECT \"type\" from " + task_config_table + postfix;
        auto rows = manager.DefaultQuery(query);
        std::string type = rows[0]["\"type\""].c_str();

        query = "SELECT \"algorithmName\", \"fileID\" FROM " + task_config_table + postfix;
        rows = manager.DefaultQuery(query);
        std::string algo_name = rows[0]["\"algorithmName\""].c_str();
        std::string file_id = rows[0]["\"fileID\""].c_str();

        query = "SELECT \"hasHeader\", \"path\", \"delimiter\" FROM " + file_info_table
                + " WHERE \"ID\" = '" + file_id + "'";
        rows = manager.DefaultQuery(query);
        char delimiter = rows[0]["\"delimiter\""].c_str()[0];
        std::string path = rows[0]["\"path\""].c_str();
        bool has_header;
        rows[0]["\"hasHeader\""] >> has_header;

        auto tableName = "\"" + type + "TasksConfig\"";
        query = "SELECT \"errorThreshold\", \"maxLHS\", \"threadsCount\" FROM " + tableName + postfix;
        rows = manager.DefaultQuery(query);
        auto error_threshold = std::stod(rows[0]["\"errorThreshold\""].c_str());
        auto max_lhs = (unsigned int)std::stoi(rows[0]["\"maxLHS\""].c_str());
        auto threads_count = (ushort)std::stoi(rows[0]["\"threadsCount\""].c_str());
        return TaskConfig(task_id, type, algo_name, error_threshold, delimiter,
                          path, has_header, max_lhs, threads_count);
    }

    const auto& GetParamsIntersection() const {
        return params_intersection_;
    }

    const std::string& GetTaskID() const { return task_id_; }
    const std::string& GetAlgo() const { return algo_; }
    const std::string& GetType() const { return type_; }

    static bool IsTaskValid(DBManager const &manager, std::string task_id) {
        std::string query = "SELECT * FROM " + task_info_table +
                            " WHERE \"deletedAt\" IS NULL"
                            " AND \"taskID\" = '" + task_id + "'";
        auto answer = manager.DefaultQuery(query);
        return answer.size() == 1;
    }

    // Send a request to DB for status updating
    void UpdateStatus(DBManager const &manager, std::string status) const {
        UpdateTaskState(manager, {{ "status", status }});
    }

    void SetMaxPhase(DBManager const& manager, size_t maxPhase) const {
        UpdateTaskState(manager, {{"maxPhase", std::to_string(maxPhase)}});
    }

    // Send a request to DB for progress updating
    void UpdateProgress(DBManager const &manager, double progress_percent,
        std::string const &phase_name, size_t cur_phase) const {
        UpdateTaskState(
            manager,
            {
                {"progress",std::to_string(progress_percent)},
                {"phaseName",phase_name},
                {"currentPhase", std::to_string(cur_phase)}
            });
    }
    
    // Send a request to DB with JSON array of primary key column positions
    void UpdatePKColumnPositions(DBManager const &manager,
                                 std::string const &keys_indices) const{
        UpdateTaskResult(manager, {{"PKColumnIndices", keys_indices}});
    }

    void SetIsExecuted(DBManager const& manager) const {
        UpdateTaskState(manager, {{ "isExecuted", "true" }});
    }

    // Send a request to DB with a set of FDs
    void UpdateDeps(DBManager const& manager, const std::string& deps) const {
        assert(type_ == "FD" || type_ == "CFD");

        auto deps_name = type_ + "s";
        UpdateTaskResult(manager, {{deps_name, deps}});
    }

    // Send a request to DB with JSON array (data for pie chart for client)
    void UpdatePieChartData(DBManager const& manager, const std::string& pie_chart_data) const {
        UpdateTaskResult(manager, {{ "pieChartData", pie_chart_data }});
    }

    // Send a request to DB for changing task's status to 'ERROR' 
    // and update errorStatus;
    void UpdateErrorStatus(DBManager const& manager, std::string error,
                           std::string error_msg) const {
        UpdateTaskState(manager, {{ "status", error }, { "errorMsg", error_msg }});
    }

    void SetElapsedTime(DBManager const& manager, unsigned long long time) const {
        UpdateTaskState(manager, {{ "elapsedTime", std::to_string(time) }});
    }
};
