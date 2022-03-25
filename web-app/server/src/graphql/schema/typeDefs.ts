import { gql } from "apollo-server-core";

const typeDefs = gql`

    scalar Upload
    
    enum InputFileFormat {
        SINGULAR
        TABULAR
    }
    
    type FileFormat {
        fileID: String!
        dataset: DatasetInfo!
        "For AR algorithm"
        inputFormat: InputFileFormat!
        """
        For AR algorithm, when type = "SINGULAR" 
        """
        tidColumnIndex: Int
        """
        For AR algorithm, when type = "SINGULAR"
        """
        itemColumnIndex: Int
        """
        For AR algorithm, when type = "TABULAR"
        """
        hasTid: Boolean
    }
    
    type Feedback {
        feedbackID: String!
        userID: String
        user: User
        rating: Int!
        subject: String
        text: String!
    }
    
    type Role {
        type: String!
        permissions: [String!]
    }
    
    input Pagination {
        offset: Int!
        limit: Int!
    }
    
    type User {
        userID: String!
        feedbacks(pagination: Pagination! = { offset: 0 limit: 10 }): [Feedback!]
        roles: [Role!]
        permissions: [PermissionType!]
        fullName: String!
        email: String!
        country: String!
        companyOrAffiliation: String!
        occupation: String!
        accountStatus: String!
        tasks(pagination: Pagination! = { offset: 0 limit: 20 } withDeleted: Boolean! = False): [TaskInfo!]
        datasets(pagination: Pagination! = { offset: 0 limit: 10 }): [DatasetInfo!]
    }
    
    enum AccountStatusType {
        EMAIL_VERIFICATION
        EMAIL_VERIFIED
    }
    
    enum SessionStatusType {
        VALID
        INVALID
    }
    
    type Session {
        sessionID: String!
        userID: String!
        user: User!
        deviceID: String!
        status: SessionStatusType!
        accessTokenIat: Int
        refreshTokenIat: Int
    }
    
    type FDAlgorithmProps {
        hasErrorThreshold: Boolean!
        hasArityConstraint: Boolean!
        isMultiThreaded: Boolean!
    }
    
    type CFDAlgorithmProps {
        hasArityConstraint: Boolean!
        hasSupport: Boolean!
        hasConfidence: Boolean!
    }
    
    type ARAlgorithmProps {
        hasSupport: Boolean!
        hasConfidence: Boolean!
    }
    
    type FDAlgorithmConfig {
        name: String!
        properties: FDAlgorithmProps!
    }

    type CFDAlgorithmConfig {
        name: String!
        properties: CFDAlgorithmProps!
    }
    
    type ARAlgorithmConfig {
        name: String!
        properties: ARAlgorithmProps!
    }
    
    type InputFileConfig {
        allowedFileFormats: [String!]!
        allowedDelimiters: [String!]!
        maxFileSize: Float!
    }
    
    type AlgorithmsConfig {
        allowedARAlgorithms: [ARAlgorithmConfig!]!
        allowedFDAlgorithms: [FDAlgorithmConfig!]!
        allowedDatasets: [DatasetInfo!]!
        allowedCFDAlgorithms: [CFDAlgorithmConfig!]!
        fileConfig: InputFileConfig!
        maxThreadsCount: Int!
    }

    enum PrimitiveType {
        FD, CFD, AR, TypoFD, TypoCluster, SpecificTypoCluster
    }
    
    enum TaskProcessStatusType {
        IN_PROCESS, COMPLETED, ADDED_TO_THE_TASK_QUEUE, ADDING_TO_DB
    }
    
    enum TaskErrorStatusType {
        INTERNAL_SERVER_ERROR, RESOURCE_LIMIT_IS_REACHED
    }
        
    enum ResourceLimitErrorType {
        MEMORY_LIMIT, TIME_LIMIT
    }
    
    interface BaseTaskError {
        errorStatus: TaskErrorStatusType!
    }
    
    type ResourceLimitTaskError implements BaseTaskError {
        errorStatus: TaskErrorStatusType!
        resourceLimitError: ResourceLimitErrorType!
    }

    type InternalServerTaskError implements BaseTaskError {
        errorStatus: TaskErrorStatusType!
        """
        Admins with permission 'VIEW_ADMIN_INFO' can view errorMsg value.
        Users without these rights will receive null
        """
        internalError: String
    }
    
    type TaskState {
        taskID: ID!
        isPrivate: Boolean!
        attemptNumber: Int!
        processStatus: TaskProcessStatusType!
        phaseName: String
        currentPhase: Int
        progress: Float!
        maxPhase: Int
        isExecuted: Boolean!
        elapsedTime: Float
    }

    union TaskStateAnswer = TaskState | ResourceLimitTaskError | InternalServerTaskError
    
    type BaseTaskConfig {
        algorithmName: String!
        type: PrimitiveType!
    }
    
    interface PrimitiveTaskConfig {
        taskID: String!
    }
    
    type FDTaskConfig implements PrimitiveTaskConfig {
        taskID: String!
        errorThreshold: Float!
        maxLHS: Int!
        threadsCount: Int!
    }
    
    type CFDTaskConfig implements PrimitiveTaskConfig {
        taskID: String!
        maxLHS: Int!
        minSupportCFD: Int!
        minConfidence: Float!
    }
    
    type ARTaskConfig implements PrimitiveTaskConfig {
        taskID: String!
        minSupportAR: Float!
        minConfidence: Float!
        fileFormat: FileFormat!
    }

    type TypoFDTaskConfig implements PrimitiveTaskConfig {
        taskID: String!
        errorThreshold: Float!
        maxLHS: Int!
        threadsCount: Int!
        
        preciseAlgorithm: String!
        approximateAlgorithm: String!
        metric: MetricType!
        "Typo Miner (>=0)"
        radius: Float!
        "Typo Miner (0<= ratio <=1)"
        ratio: Float!
    }

    type TypoClusterTaskConfig implements PrimitiveTaskConfig {
        taskID: String!
        typoTaskID: String!
        typoFD: FD!
    }

    type SpecificTypoClusterTaskConfig implements PrimitiveTaskConfig {
        taskID: String!
        typoClusterTaskID: String!
        clusterID: Int!
    }
    
    type Column {
        name: String!
        index: Int!
    }
    
    type FD {
        lhs: [Column!]!
        rhs: Column!
    }
    
    type CFD {
        lhs: [String!]!
        rhs: String!
        lhsPatterns: [String!]!
        rhsPattern: String!
    }
    
    type AR {
        lhs: [String!]!
        rhs: [String!]!
        support: Float!
    }

    type FDPieChartRow {
        column: Column!
        value: Float!
    }
    
    type PieChartWithoutPatterns {
        lhs: [FDPieChartRow!]!
        rhs: [FDPieChartRow!]!
    }

    type CFDPieChartRow {
        column: Column!
        pattern: String!
        value: Float!
    }
    
    type PieChartWithPatterns {
        lhs: [CFDPieChartRow!]!
        rhs: [CFDPieChartRow!]!
    }
    
    type CFDPieCharts {
        withPatterns: PieChartWithPatterns!
        withoutPatterns: PieChartWithoutPatterns!
    }
    
    interface PrimitiveTaskResult {
        taskID: String!
    }
    
    type ClusterItem {
        rowIndex: Int!
        row(squashed: Boolean! = false): [String!]!
        isSuspicious: Boolean!
    }
    
    type SquashedClusterItem {
        rowIndex: Int!
        row(squashed: Boolean! = false): [String!]!
        amount: Int!
    }
    
    type Cluster {
        id: Int!
        items(pagination: Pagination!): [ClusterItem!]
    }
    
    type SquashedCluster {
        id: Int!
        items(pagination: Pagination!): [SquashedClusterItem!]
    }
    
    type ARTaskResult implements PrimitiveTaskResult {
        taskID: String!
        ARs(pagination: Pagination! = { offset: 0 limit: 100 }): [AR!]!
    }
    
    type CFDTaskResult implements PrimitiveTaskResult {
        taskID: String!
        CFDs(pagination: Pagination! = { offset: 0 limit: 100 }): [CFD!]!
        PKs: [Column!]!
        pieChartData: CFDPieCharts!
    }
    
    enum SortSide { LHS RHS }
    enum SortBy { COL_ID COL_NAME }
    enum OrderBy { ASC DESC }
    
    input FDsFilter {
        filterString: String
        sortSide: SortSide!
        sortBy: SortBy!
        orderBy: OrderBy!
        mustContainRhsColIndices: [Int!]
        mustContainLhsColIndices: [Int!]
        withoutKeys: Boolean!
        pagination: Pagination!
    }
    
    type FDTaskResult implements PrimitiveTaskResult {
        taskID: String!
        FDs(filter: FDsFilter!): [FD!]!
        PKs: [Column!]!
        pieChartData: PieChartWithoutPatterns!
    }

    type TypoFDTaskResult implements PrimitiveTaskResult {
        taskID: String!
        TypoFDs(pagination: Pagination! = { offset: 0 limit: 100 }): [FD!]!
    }
    
    type TypoClusterTaskResult implements PrimitiveTaskResult {
        taskID: String!
        "Only for preview. You must use specific typo cluster task to get more info about clusters. (By default sorted by unique)"
        TypoClusters(pagination: Pagination! = { offset: 0 limit: 3 }): [Cluster!]!
        clustersCount: Int!
    }

    type SpecificTypoClusterTaskResult implements PrimitiveTaskResult {
        taskID: String!
        cluster(sort: Boolean! = true): Cluster!
        squashedCluster(sort: Boolean! = true): SquashedCluster!
    }
    
    type PrimitiveTaskData {
        baseConfig: BaseTaskConfig!
        specificConfig: PrimitiveTaskConfig!
        result: PrimitiveTaskResult
    }
    
    type TaskInfo {
        taskID: String!
        state: TaskStateAnswer!
        data: PrimitiveTaskData!
        dataset: DatasetInfo!
    }
    
    enum PermissionType {
        USE_BUILTIN_DATASETS, USE_OWN_DATASETS, USE_USERS_DATASETS,
        VIEW_ADMIN_INFO,
        MANAGE_USERS_SESSIONS, MANAGE_APP_CONFIG
    }
    
    type Snippet {
        header: [String!]
        rows(pagination: Pagination!): [[String!]!]!
        datasetInfo: DatasetInfo!
    }
    
    input DatasetsQueryProps {
        includeBuiltInDatasets: Boolean! = true
        includeDeletedDatasets: Boolean! = false
        pagination: Pagination! = { offset: 0 limit: 10 }
    }
    
    input TasksInfoFilter {
        includeDeletedTasks: Boolean! = true
        includeExecutedTasks: Boolean! = true
        includeCurrentTasks: Boolean! = true
        includeTasksWithError: Boolean! = true
        includeTasksWithoutError: Boolean! = true
    }
    
    type DatasetInfo {
        fileID: String!
        userID: ID
        isBuiltIn: Boolean!
        fileName: String!
        originalFileName: String!
        mimeType: String
        encoding: String
        hasHeader: Boolean!
        header: [String!]
        path: String!
        delimiter: String!
        rowsCount: Int!
        countOfColumns: Int
        fileFormat: FileFormat
        snippet: Snippet!
        supportedPrimitives: [PrimitiveType!]!
        tasks(filter: TasksInfoFilter!): [TaskInfo!]
    }
    
    type Query {
        algorithmsConfig: AlgorithmsConfig!
        """
        This query allows admin with permission "VIEW_ADMIN_INFO" see users feedbacks
        Throws an error if limit <= 0 or limit > 100 offset < 0 
        """
        feedbacks(limit: Int! = 10, offset: Int! = 0): [Feedback!]
        """
        When user isn't authorized, he must get permissions for anonymous user.
        If user logged in, he must extract permission from access token.
        ***
        Tasks, created by anonymous, can't be private
        """
        getAnonymousPermissions: [PermissionType!]!
        
        """
        Query for admins with permission "VIEW_ADMIN_INFO"
        """
        datasets(props: DatasetsQueryProps!): [DatasetInfo!]
        """
        All user can see built in dataset
        Authorized users can see their dataset
        Users with permission "VIEW_ADMIN_INFO" can see all dataset
        """
        datasetInfo(fileID: ID!): DatasetInfo
        """
        User can see results if one of the conditions is met:
        1) Task was created by anonymous
        2) Task was created by this user
        3) Task isn't private
        4) User has permission "VIEW_ADMIN_INFO"
        """
        taskInfo(taskID: ID!): TaskInfo!
        """
        Query for admins with permission "VIEW_ADMIN_INFO"
        """
        tasksInfo(pagination: Pagination!): [TaskInfo!]
        user(userID: ID!): User
        """
        Query for admins with permission "VIEW_ADMIN_INFO"
        """
        users(pagination: Pagination!): [User!]!
        """
        Query for admins with permission "VIEW_ADMIN_INFO"
        """
        sessions(pagination: Pagination! onlyValid: Boolean! = true): [Session]!
    }
    
    input FileProps {
        delimiter: String!
        hasHeader: Boolean!
        "For AR algorithm"
        inputFormat: InputFileFormat
        """
        For AR algorithm, when type = "SINGULAR"
        """
        tidColumnIndex: Int
        """
        For AR algorithm, when type = "SINGULAR"
        """
        itemColumnIndex: Int
        """
        For AR algorithm, when type = "TABULAR"
        """
        hasTid: Boolean
    }
    
    type DeleteTaskAnswer {
        message: String!
    }
    
    input CreatingUserProps {
        fullName: String!
        email: String!
        pwdHash: String!
        country: String!
        companyOrAffiliation: String!
        occupation: String!
    }
    
    type CreateUserAnswer {
        message: String!
        tokens: TokenPair!
    }
    
    type IssueVerificationCodeAnswer {
        message: String!
    }
    
    type TokenPair {
        refreshToken: String!
        accessToken: String!
    }
    
    enum MetricType {
        MODULUS_OF_DIFFERENCE
        LEVENSHTEIN
    }
    
    input IntersectionTaskProps {
        algorithmName: String
        type: PrimitiveType!
        "FD, TypoFD"
        errorThreshold: Float
        "FD, TypoFD, CFD"
        maxLHS: Int
        "FD, TypoFD"
        threadsCount: Int
        "CFD"
        minSupportCFD: Int
        "AR"
        minSupportAR: Float
        "CFD, AR"
        minConfidence: Float
        "TypoFD"
        preciseAlgorithm: String
        "TypoFD"
        approximateAlgorithm: String
        "TypoFD"
        metric: MetricType
        "TypoFD (>=0)"
        radius: Float
        "TypoFD (0..1)"
        ratio: Float
        
        "TypoCluster"
        typoTaskID: String
        "SpecificTypoCluster"
        typoClusterTaskID: String
        "TypoCluster"
        typoFD: String
        "SpecificTypoCluster"
        clusterID: Int
    }
    
    type SuccessfulMessage {
        message: String!
    }
    
    union ChangePasswordAnswer = TokenPair | SuccessfulMessage
    
    type Mutation {
        """
        After creating new account user will have anonymous permissions;
        """
        createUser(props: CreatingUserProps!): CreateUserAnswer!
        
        """
        Code for email approving is temporary (24 hours, destroys after first attempt).
        User must be logged in account and have account status Email Verification.
        Returns new token pair.
        """
        approveUserEmail(codeValue: Int!): TokenPair!
        """
        This query issues (or reissues) new verification code.
        Previous code will be destroyed.
        """
        issueVerificationCode: IssueVerificationCodeAnswer!
        """
        User mustn't be logged in. After the request, a confirmation code
        will be sent to the user's mail (code expires after 1h, dies after 1st use).
        This code user should sent in mutation approveRecoveryCode.
        """
        issueCodeForPasswordRecovery(email: String!): IssueVerificationCodeAnswer!
        """
        User can be logged in to multiple accounts at once.
        Client must pass password hash in params (not password!).
        If user's email wasn't approved, he will not be able to log in.
        """
        logIn(email: String!, pwdHash: String!): TokenPair!
        
        """
        If user wants to close all session, he must pass option allSession with value true.
        By default, only current session will be closed.
        If the request throws an error, then the user wasn't logged out of the account (session still valid)
        """
        logOut(allSessions: Boolean! = false): String!
        
        """
        When user's access token expired, client must send request fir refreshToken.
        If access token is already expired, you mustn't set header authorization with accessToken.
        Otherwise you will see error with code 401.
        """
        refresh(refreshToken: String!): TokenPair!
        """
        This mutation can be used in two cases:
        1) User logged in and wants to change his password.
        He must send current and new password hashes.
        Throws error if new pwd equal to previous or current pwd incorrect
        2) User approved verification code for password recovery.
        He must send hash for new password and email.
        """
        changePassword(currentPwdHash: String newPwdHash: String! email: String): ChangePasswordAnswer!
        """
        User mustn't be logged in. User must send code.
        Then user must send query changePassword without current password hash.
        """
        approveRecoveryCode(email: String! codeValue: Int!): SuccessfulMessage!
        """
        Creates feedback for user and saves information to the database.
        Administrators (with permission "VIEW_ADMIN_INFO") can see feedbacks
        """
        createFeedback(rating: Int!, subject: String, text: String!): Feedback!
        
        """
        This query allows authorized users upload datasets.
        User can choose his own datasets (pass fileID) in query createTaskWithDatasetChoosing.
        """
        uploadDataset(datasetProps: FileProps!, table: Upload!): DatasetInfo!
        
        """
        This query supports several restrictions:
        1) Anonymous (with permission "USE_BUILTIN_DATASETS") can only choose built in dataset
        2) Authorized user (with permission "USE_OWN_DATASETS") can also choose his uploaded datasets
        3) Administrators (with permission "USE_USERS_DATASETS") can use all datasets
        ***
        By default, the result of the algorithm is visible for all users.
        """
        createTaskWithDatasetChoosing(props: IntersectionTaskProps!, fileID: ID!): TaskState!
        
        createTypoMinerTask(props: IntersectionTaskProps!): TaskState!
        
        
        """
        This query allows clients (with permission USE_OWN_DATASETS) upload dataset and create task.
        ***
        By default, the result of the algorithm is visible for all users.
        """
        createTaskWithDatasetUploading(props: IntersectionTaskProps!, datasetProps: FileProps!, table: Upload!): TaskState!
        
#        """
#        This query allows admin with permission "MANAGE_APP_CONFIG" change dataset property "isBuiltIn".
#        """
#        setDatasetBuiltInStatus(fileID: String!, isBuiltIn: Boolean!): DatasetInfo!
        
        """
        Soft delete. Users can delete own tasks. Administrators can delete task of any user.
        """
        deleteTask(taskID: ID! safeDelete: Boolean! = true): DeleteTaskAnswer!
        
        """
        By default, task's result is public. (Only authorized people can look results)
        This query allows client to set task privacy.
        """
        changeTaskResultsPrivacy(taskID: String!, isPrivate: Boolean!): TaskInfo!        
    }
`;

export = typeDefs;
