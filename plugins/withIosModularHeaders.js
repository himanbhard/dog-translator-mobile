const { withPodfile } = require('@expo/config-plugins');

const withIosModularHeaders = (config) => {
  return withPodfile(config, (config) => {
    let podfileContent = config.modResults.contents;

    // 1. Re-Add use_modular_headers! (Required since we are not using use_frameworks anymore)
    if (!podfileContent.includes('use_modular_headers!')) {
      podfileContent = podfileContent.replace(
        /use_expo_modules!/g,
        `use_expo_modules!\n  use_modular_headers!`
      );
    }

    // Keep the C++ fix just in case, it doesn't hurt.
    const fixPattern = "config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'";
    if (!podfileContent.includes(fixPattern)) {
      podfileContent = podfileContent.replace(
        /react_native_post_install\(/g,
        `
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
      end
    end
    react_native_post_install(`
      );
    }

    config.modResults.contents = podfileContent;
    return config;
  });
};

module.exports = withIosModularHeaders;
