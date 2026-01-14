# Gemini Bootstrap Instructions
# After a workspace reload, please provide the following instructions to restore your context:
# "Good morning Gemini. Please read the bootstrap instructions in dev.nix to get started."
#
# The files to read are:
# 1. docs/project_context.md
# 2. .idx/airules.md

{ pkgs, ... }: {
  # Specifies the Nixpkgs channel.
  channel = "stable-24.05";

  # A list of packages to install.
  packages = [
    (pkgs.python3.withPackages (ps: with ps; [
     mkdocs
     mkdocs-material
     pymdown-extensions
   ]))
   pkgs.caddy # Add caddy for serving the web app
  ];

  # A set of environment variables to define.
  env = {};

  # VS Code extensions to install.
  idx = {
    extensions = [
      "ms-python.python"
    ];
    workspace = {
      # The onCreate hook is no longer needed as Nix now manages our Python packages.
    };
    previews = {
      enable = true;
      previews = {
        web = {
          # Use Caddy to serve the 3D configurator app
          command = ["caddy" "file-server" "--root" "apps/3d-configurator" "--listen" ":$PORT" "--browse"];
          manager = "web";
        };
      };
    };
  };
}
