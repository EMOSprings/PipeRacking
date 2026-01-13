
# See https://developers.google.com/idx/guides/customize-idx-env
# for more details on customizing your environment.
{ pkgs, ... }: {
  # Specifies the Nixpkgs channel.
  channel = "stable-24.05";

  # A list of packages to install.
  packages = [
    pkgs.python3
    pkgs.pip
    pkgs.nodejs_20  # Added Node.js for web-related tools
  ];

  # A set of environment variables to define.
  env = {};

  # VS Code extensions to install.
  idx = {
    extensions = [
      "ms-python.python"
      "esbenp.prettier-vscode"
    ];
    workspace = {
      # Runs when a workspace is first created.
      onCreate = {
        install-deps = "pip install -r requirements.txt";
      };
      # Runs every time the workspace is (re)started.
      onStart = {
        # The command to run your app, e.g. "npm run dev"
      };
    };
    # Configures a web preview for your application.
    previews = {
      enable = true;
      previews = {
        web = {
          # Command to start your web server
          command = ["mkdocs" "serve" "-f" "mkdocs.yml" "-a" "0.0.0.0:$PORT"];
          manager = "web";
        };
      };
    };
  };
}
