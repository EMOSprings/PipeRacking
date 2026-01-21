{ pkgs, ... }: {
  # 1. Nixpkgs channel
  # We'll use a stable channel to ensure our environment is reproducible.
  channel = "stable-24.05";

  # 2. Packages
  # Caddy is the only system package we need for our web server skeleton.
  packages = [
    pkgs.caddy
    pkgs.python3
  ];

  # 3. Web Preview
  # This section configures the web preview for our site.
  idx.previews = {
    enable = true;
    previews = {
      # We'll name our preview "web"
      web = {
        # This is the command that starts the Caddy server.
        # It serves the /public directory on the port provided by the environment.
        command = ["caddy" "file-server" "--root" "public" "--listen" ":$PORT"];
        manager = "web";
      };
    };
  };
}
