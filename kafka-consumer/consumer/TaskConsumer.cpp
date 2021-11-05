
#include <algorithm>
#include <cctype>
#include <filesystem>
#include <iostream>
#include <optional>
#include <string>
#include <vector>
#include <chrono>
#include <thread>

#include <boost/program_options.hpp>

#include "logging/easylogging++.h"

#include "algorithms/Pyro.h"
#include "algorithms/TaneX.h"
#include "algorithms/FastFDs.h"
#include "algorithms/DFD/DFD.h"
#include "algorithms/Fd_mine.h"

#include "TaskConsumer.h"

INITIALIZE_EASYLOGGINGPP

std::string TaskConfig::tableName = "tasks";

void TaskConsumer::processMsg(nlohmann::json payload, 
                              DBManager const &manager) const {
    auto taskID = std::string(payload["taskID"]);
    if (!TaskConfig::taskExists(manager, taskID)) {
        std::cout << "Task with ID = '" << taskID 
                  << "' isn't in the database (Task wasn't processed (skipped))" 
                  << std::endl;
    } else {
        auto task = TaskConfig::getTaskConfig(manager, taskID);
        task.writeInfo(std::cout);
        try {
            processTask(task, manager);
        } catch (const std::exception& e) {
            std::cout << "Unexpected behaviour in 'process_task()' (Task wasn't commited)" 
                      << std::endl;
            task.updateErrorStatus(manager, "SERVER ERROR", e.what());
            return;
        }
        std::cout << "Task with ID = '" << taskID 
                  << "' was successfully processed." << std::endl;
    }
}

void TaskConsumer::processTask(TaskConfig const& task, 
                               DBManager const& manager) const {
    std::vector<std::string> algsWithProgress {
        "FastFDs"
    };

    auto alg = task.getAlgName();
    auto datasetPath = task.getDatasetPath();
    auto separator = task.getSeparator();
    auto hasHeader = task.getHasHeader();
    auto error = task.getErrorPercent();
    auto maxLHS = task.getMaxLHS();
    
    auto seed = 0;
    unsigned int parallelism = 0;

    el::Loggers::configureFromGlobal("logging.conf");
    
    std::unique_ptr<FDAlgorithm> algorithmInstance;

    std::cout << "Input: algorithm \"" << alg
              << "\" with seed " << std::to_string(seed)
              << ", error \"" << std::to_string(error)
              << ", maxLHS \"" << std::to_string(maxLHS)
              << "\" and dataset \"" << datasetPath
              << "\" with separator \'" << separator
              << "\'. Header is " << (hasHeader ? "" : "not ") << "present. " 
              << std::endl;

    if (alg == "Pyro") {
        algorithmInstance = std::make_unique<Pyro>(datasetPath, separator, 
                            hasHeader, seed, error, maxLHS, parallelism);
    } else if (alg == "TaneX") {
        algorithmInstance = std::make_unique<Tane>(datasetPath, separator, 
                            hasHeader, error, maxLHS);
    } else if (alg == "FastFDs") {
        algorithmInstance = std::make_unique<FastFDs>(datasetPath, separator, hasHeader);
    } else if (alg == "FD mine") {
        algorithmInstance = std::make_unique<Fd_mine>(datasetPath, separator, hasHeader);
    } else if (alg == "DFD") {
        algorithmInstance = std::make_unique<DFD>(datasetPath, separator, hasHeader);
    }

    try {
        task.updateStatus(manager, "IN PROCESS");
        
        unsigned long long elapsedTime;

        const auto& phaseNames = algorithmInstance->getPhaseNames();
        task.setMaxPhase(manager, phaseNames.size());
        task.updateProgress(manager, 0, phaseNames[0].data(), 1);

        if (std::find(algsWithProgress.begin(), algsWithProgress.end(), alg)
            != algsWithProgress.end()) {
            std::thread progress_listener([&task, &manager, &algorithmInstance, &phaseNames] {
                auto progress = algorithmInstance->getProgress();
                while(progress.second != 100) {
                    progress = algorithmInstance->getProgress();
                    task.updateProgress(manager, progress.second, 
                                        phaseNames[progress.first].data(), progress.first + 1);
                    std::this_thread::sleep_for(std::chrono::milliseconds(100));
                }
            });
            elapsedTime = algorithmInstance->execute();
            progress_listener.join();
        } else {
            elapsedTime = algorithmInstance->execute();
            task.updateProgress(manager, 100);
        }

        task.setElapsedTime(manager, elapsedTime);
        task.updateJsonFDs(manager, algorithmInstance->getJsonFDs(false));
        task.updateJsonArrayNameValue(manager, algorithmInstance->getJsonArrayNameValue());
        task.updateJsonColumnNames(manager, algorithmInstance->getJsonColumnNames());
        task.updateStatus(manager, "COMPLETED");
        return;
    } catch (std::runtime_error& e) {
        std::cout << e.what() << std::endl;
        throw e;
    }
    throw std::runtime_error("Unexpected behavior during task executing");
}