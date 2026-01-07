using EmbedWynDashboardsViaDiv_MVC.Models;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EmbedWynDashboardsViaDiv_MVC.Controllers
{
    public class WynPortalController : Controller
    {
        public IActionResult Index(string url, string username, string version)
        {
            ViewBag.WynParams = new WynUser() { WynUrl = url.TrimEnd('/'), Username = username, Version = version.ToString() };
            return View();
        }
    }
}
