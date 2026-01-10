const { withXcodeProject } = require('@expo/config-plugins');

const withAllowNonModularHeaders = (config) => {
    return withXcodeProject(config, (config) => {
        const xcodeProject = config.modResults;
        const configurations = xcodeProject.pbxProjectSection();

        for (const key in configurations) {
            if (typeof configurations[key].buildSettings !== 'undefined') {
                const buildSettings = configurations[key].buildSettings;
                buildSettings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES';
            }
        }

        return config;
    });
};

module.exports = withAllowNonModularHeaders;
