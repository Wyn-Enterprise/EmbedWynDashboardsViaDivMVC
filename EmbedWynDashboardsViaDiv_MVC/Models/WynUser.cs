using System.ComponentModel.DataAnnotations;

namespace EmbedWynDashboardsViaDiv_MVC.Models
{
    public class WynUser
    {
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
