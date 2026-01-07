using EmbedWynDashboardsViaDiv_MVC.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace EmbedWynDashboardsViaDiv_MVC.Controllers
{
    public class WynPortalController : Controller
    {
        public IActionResult Index(string url, string username, string version)
        {
            ViewBag.WynParams = new WynUser() { WynUrl = url.TrimEnd('/'), Username = username, Version = version.ToString() };
            ViewBag.AccessToken = HttpContext.Session.GetString("AccessToken");
            return View();
        }
    }
}
