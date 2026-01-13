# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-24.05"; # or "unstable"

  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.python3Packages.pip
    pkgs.python3Packages.mkdocs
    pkgs.python3Packages.mkdocs-material
  ];

  # Sets environment variables in the workspace
  env = {
    # This is a placeholder for the Google Auth credentials.
    # You will replace this with your actual credentials later.
    GOOGLE_CLIENT_ID = "YOUR_CLIENT_ID_HERE";
    GOOGLE_CLIENT_SECRET = "YOUR_SECRET_HERE";
  };

  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      "google.gemini-cli-vscode-ide-companion"
    ];

    # Enable previews
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["mkdocs" "serve" "--dev-addr" "0.0.0.0:$PORT"];
          manager = "web";
        };
      };
    };

    # Workspace lifecycle hooks
    workspace = {
      # Runs when a workspace is first created
      onCreate = {
        # Install the mkdocs social plugin for Google Auth
        install-mkdocs-social = "pip install mkdocs-social";
        # Open key files on workspace start
        default.openFiles = [ "mkdocs.yml" "docs/index.md" ".idx/dev.nix" ];
      };

      # Runs when the workspace is (re)started
      onStart = {
        # Automatically start the website server
        start-web-server = "mkdocs serve --dev-addr 0.0.0.0:$PORT";
      };
    };
  };
}
