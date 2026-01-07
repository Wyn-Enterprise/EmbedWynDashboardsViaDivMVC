# EmbedWynDashboardsViaDivMVC

Sample to show integration of Wyn Designer &amp; Viewer using Div in a ASP.NET Core MVC application

This sample showcases the newly added APIs in Wyn Enterprise to integrate the Wyn Designer and Viewer components in an ASP.NET Core MVC application via Div.

Here's a sample screen shot of the output on running this sample

![alt text](Screenshot.PNG)

**Setup Wyn Enterprise**

1. Open the Admin portal on your Wyn Enterprise
2. Go to 'Configurations -> System Configurations'
3. Add 'http://localhost:3000' under the 'Allowed CORS Origins' section and click Save.

**Steps before running the sample**

1. Changing Target Framework from .Net6.0 to . Net8.0
2. Update the packages.
3. If Under Dependencies you see this warning:
   npm(wwwroot\package.json)
   @wynenterprise/wyn-integration – not installed

Follow the below steps to fix it:
What the warning means:
@wynenterprise/wyn-integration – not installed
This means:
• package.json declares the dependency
• node_modules/@wynenterprise/wyn-integration does not exist
• Visual Studio therefore shows a warning under Dependencies → npm
ASP.NET Core does not automatically restore npm packages
Open a terminal in wwwroot
From your project root:
Use Visual Studio → Right-click wwwroot → Open in Terminal
Install the package
npm install @wynenterprise/wyn-integration
This will:
• Create node_modules
• Download Wyn integration scripts
• Remove the warning in Visual Studio

4. Now run from the application
5. Enter in the shown login screen:
   Wyn Server Url,
   username,
   password,
   Click Login
