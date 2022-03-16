#include <algorithm>
#include <cctype>
#include <filesystem>
#include <iostream>
#include <optional>
#include <string>
#include <vector>

#include "db/TaskConfig.h"
#include "db/DBManager.h"

#include <boost/program_options.hpp>
#include <easylogging++.h>

#include "AlgoFactory.h"

namespace po = boost::program_options;

//INITIALIZE_EASYLOGGINGPP

std::string TaskConfig::taskInfoTable = "\"TasksInfo\"";
std::string TaskConfig::fileInfoTable = "\"FilesInfo\"";
std::string TaskConfig::taskConfigTable = "\"TasksConfig\"";
std::string TaskConfig::FDTaskConfigTable = "\"FDTasksConfig\"";
//std::string TaskConfig::CFDTaskConfigTable = "\"CFDTasksConfig\"";
std::string TaskConfig::FDTaskResultTable = "\"FDTasksResult\"";
std::string TaskConfig::CFDTaskResultTable = "\"CFDTasksResult\"";


static std::string dbConnection() {
    std::string host = std::getenv("POSTGRES_HOST");
    std::string port = std::getenv("POSTGRES_PORT");
    std::string user = std::getenv("POSTGRES_USER");
    std::string password = std::getenv("POSTGRES_PASSWORD");
    std::string dbname = std::getenv("POSTGRES_DBNAME");

    return "postgresql://" + user + ":" + password + "@" + host + ":" + port + "/" + dbname;
}

void processTask(TaskConfig const& task, 
                               DBManager const& manager) {
//    auto algo_name = task.getAlgName();
//    auto dataset_path = task.getDatasetPath();
//    auto separator = task.getSeparator();
//    auto hasHeader = task.getHasHeader();
//    auto seed = 0;
//    auto error = task.getErrorPercent();
//    auto maxLhs = task.getMaxLhs();
//    auto parallelism = task.getParallelism();
//
    //el::Loggers::configureFromGlobal("logging.conf");
//
//    std::unique_ptr<FDAlgorithm> algInstance;
//
//    std::cout << "Input: algorithm \"" << algName
//              << "\" with seed " << std::to_string(seed)
//              << ", error \"" << std::to_string(error)
//              << ", maxLhs \"" << std::to_string(maxLhs)
//              << "\" and dataset \"" << datasetPath
//              << "\" with separator \'" << separator
//              << "\'. Header is " << (hasHeader ? "" : "not ") << "present. "
//              << std::endl;
//
//
//    try {
//        task.updateStatus(manager, "IN PROCESS");
//
//        unsigned long long elapsedTime;
//        const auto& phaseNames = algInstance->getPhaseNames();
//        auto maxPhase = phaseNames.size();
//        task.setMaxPhase(manager, maxPhase);
//        task.updateProgress(manager, 0, phaseNames[0].data(), 1);
//
//        auto executionThread = std::async(
//            std::launch::async,
//            [&elapsedTime, &algInstance]() -> void {
//                elapsedTime = algInstance->execute();
//            }
//        );
//        std::future_status status;
//        do {
//            status = executionThread.wait_for(std::chrono::seconds(0));
//            if (status == std::future_status::ready) {
//                std::cout << "Algorithm was executed" << std::endl;
//                task.updateProgress(manager, 100, phaseNames[maxPhase-1].data(), maxPhase);
//            } else if (status == std::future_status::timeout) {
//                if (TaskConfig::isTaskCancelled(manager, task.getTaskID())) {
//                    std::cout << "Task with ID = " << task.getTaskID()
//                              << " was cancelled." << std::endl;
//                    break;
//                }
//                auto [cur_phase, phaseProgress] = algInstance->getProgress();
//                task.updateProgress(manager, phaseProgress,
//                                    phaseNames[cur_phase].data(), cur_phase + 1);
//            } else {
//                throw std::runtime_error("Main thread: unknown future_status");
//            }
//            std::this_thread::sleep_for(std::chrono::milliseconds(100));
//        } while (status != std::future_status::ready);
//
//        if (!TaskConfig::isTaskCancelled(manager, task.getTaskID())) {
//            task.setElapsedTime(manager, elapsedTime);
//            auto PKColumnPositions = algInstance->getPKColumnPositions(
//                                                  CSVParser(datasetPath, separator, hasHeader));
//            task.updatePKColumnPositions(manager, PKColumnPositions);
//            task.updateJsonDeps(manager, algInstance->getJsonFDs(false));
//            task.updatePieChartData(manager, algInstance->getPieChartData());
//            task.updateStatus(manager, "COMPLETED");
//        } else {
//            task.updateStatus(manager, "CANCELLED");
//        }
//        task.setIsExecuted(manager);
//        return;
//    } catch (std::runtime_error& e) {
//        std::cout << e.what() << std::endl;
//        throw e;
//    }
}

void processMsg(std::string taskID,
                             DBManager const &manager) {
    if (!TaskConfig::isTaskExists(manager, taskID)) {
        std::cout << "Task with ID = '" << taskID
                  << "' isn't in the database. (Task wasn't processed (skipped))"
                  << std::endl;
    } else {
        auto task = TaskConfig::getTaskConfig(manager, taskID);
        if (TaskConfig::isTaskCancelled(manager, taskID)) {
            std::cout << "Task with ID = '" << taskID
                      << "' was cancelled." << std::endl;
        } else {
            task.writeInfo(std::cout);
            try {
                processTask(task, manager);
            } catch (const std::exception& e) {
                std::cout << "Unexpected behaviour in 'process_task()'. (Task wasn't commited)"
                        << std::endl;
                task.updateErrorStatus(manager, "SERVER ERROR", e.what());
                return;
            }
            std::cout << "Task with ID = '" << taskID
                    << "' was successfully processed." << std::endl;
        }
    }
}

int main(int argc, char *argv[])
{   
    std::string taskId = argv[1];
    try {
        DBManager DBManager(dbConnection());
        processMsg(taskId, DBManager);
    } catch (const std::exception& e) {
        std::cerr << "% Unexpected exception caught: " << e.what() << std::endl;
        return 1;
    }
    return 0;
}
