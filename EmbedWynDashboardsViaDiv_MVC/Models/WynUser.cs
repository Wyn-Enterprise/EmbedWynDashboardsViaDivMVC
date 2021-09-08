using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace EmbedWynDashboardsViaDiv_MVC.Models
{
    public class WynUser
    {
        [Required]
        public static string BaseWynUrl { get; set; }
        public static string AccessToken { get; set; }
        [Required]
        public string WynUrl { get; set; }
        [Required]
        public string Username { get; set; }
        [Required]
        public string Password { get; set; }
        public string DashboardId { get; set; }
        public string Version { get; set; }
    }
}
