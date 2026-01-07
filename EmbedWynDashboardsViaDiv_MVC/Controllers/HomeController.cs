using EmbedWynDashboardsViaDiv_MVC.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;

namespace EmbedWynDashboardsViaDiv_MVC.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly WynSettings _wynSettings;
        private readonly IHttpClientFactory _httpClientFactory;

        [BindProperty]
        public WynUser WynUserInput { get; set; }

        public HomeController(ILogger<HomeController> logger, IOptions<WynSettings> wynSettings, IHttpClientFactory httpClientFactory)
        {
            _logger = logger;
            _wynSettings = wynSettings.Value;
            _httpClientFactory = httpClientFactory;
        }

        public IActionResult Index()
        {            
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Index([Bind] WynUser user)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return View();
                }

                var request = new HttpRequestMessage(HttpMethod.Post, user.WynUrl.TrimEnd('/') + "/connect/token");

                Dictionary<string, string> body = new Dictionary<string, string>();
                body.Add("grant_type", "password");
                body.Add("username", WynUserInput.Username);
                body.Add("password", WynUserInput.Password);
                body.Add("client_id", _wynSettings.ClientId);
                body.Add("client_secret", _wynSettings.ClientSecret);

                request.Content = new FormUrlEncodedContent(body);
                request.Content.Headers.ContentType = new MediaTypeHeaderValue("application/x-www-form-urlencoded");

                var client = _httpClientFactory.CreateClient();
                var response = await client.SendAsync(request);

                if (response.IsSuccessStatusCode)
                {
                    HttpContext.Session.SetString("BaseWynUrl", WynUserInput.WynUrl);
                    var res = await response.Content.ReadAsStringAsync();
                    var resJson = JsonConvert.DeserializeObject<Token>(res);
                    HttpContext.Session.SetString("AccessToken", resJson.Access_Token);

                    var requestConfig = new HttpRequestMessage(HttpMethod.Get, user.WynUrl.TrimEnd('/') + "/api/dashboards/config?token=" + resJson.Access_Token);
                    var configClient = _httpClientFactory.CreateClient();
                    var configResponse = await configClient.SendAsync(requestConfig);

                    if (configResponse.IsSuccessStatusCode)
                    {
                        var configres = await configResponse.Content.ReadAsStringAsync();
                        var configresJson = JsonConvert.DeserializeObject<WynConfig>(configres);
                        string wynVersion = configresJson.Version;
                        return RedirectToAction("Index", "WynPortal", new { url = WynUserInput.WynUrl, username = WynUserInput.Username, version = wynVersion });
                    }
                    
                    ModelState.AddModelError(string.Empty, "Failed to retrieve Wyn configuration.");
                    return View();
                }
                else
                {
                    _logger.LogError("Authentication failed: {StatusCode} - {Reason}", response.StatusCode, response.ReasonPhrase);
                    ModelState.AddModelError(string.Empty, $"Authentication failed: {response.ReasonPhrase}");
                    return View();
                }
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Network error connecting to Wyn Server");
                ModelState.AddModelError(string.Empty, "Unable to connect to Wyn Server. Please check the URL and try again.");
                return View();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during authentication");
                ModelState.AddModelError(string.Empty, "An unexpected error occurred. Please try again.");
                return View();
            }
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
