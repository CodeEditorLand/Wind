/**
 * Multi-Agent Coordination Tests
 *
 * Comprehensive testing suite for multi-agent coordination system
 * providing unit tests, integration tests, and performance tests
 * for Wind, Mountain, Cocoon, and Air agent coordination.
 */
export declare const MultiAgentCoordinationTestUtils: {
    createTestConflict: (agents: string[], type: string, severity: string) => {
        id: string;
        agents: string[];
        type: string;
        severity: string;
        description: string;
    };
    createTestError: (agent: string, type: string, message: string) => {
        id: string;
        agent: string;
        type: string;
        message: string;
        timestamp: number;
    };
    validateAgentStatus: (status: any) => void;
};
//# sourceMappingURL=MultiAgentCoordination.test.d.ts.map