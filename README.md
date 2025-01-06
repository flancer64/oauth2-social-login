# OAuth2-Social-Login

An OAuth2-based social login plugin for TeqFW, enabling seamless user registration and authentication via Google,
GitHub, and Facebook.

## Features

### CLI Commands

- **`Fl64_OAuth2_Social_Back_Cli_Provider_Create`**: Register a new OAuth2 provider.

### InMemory Stores

- **`Fl64_OAuth2_Social_Back_Store_Mem_State`**: CSRF states with automatic cleanup.

### Database Schemas

- **`Fl64_OAuth2_Social_Back_Store_RDb_Schema_Provider`**: Stores information about OAuth2 login providers.

### Web Handlers

#### /fl64-oauth2-social/

- **`/callback/`**: Handles OAuth2 callback requests.
- **`/provider-select/`**: Manages OAuth2 provider selection requests.

### Plugin API to Implement

- **`Fl64_OAuth2_Social_Back_Api_App_UserManager`**: Manages project user data, enabling the plugin to retrieve or
  update it.