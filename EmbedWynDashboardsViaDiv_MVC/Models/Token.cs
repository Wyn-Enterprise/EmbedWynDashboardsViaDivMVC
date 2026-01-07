namespace EmbedWynDashboardsViaDiv_MVC.Models
{
    public class Token
    {
        public string Access_Token { get; set; }
        public long Expires_In { get; set; }
        public string Token_Type { get; set; }
    }

    public class WynConfig
    {
        public string Version { get; set; }
        public string UserId { get; set; }
        public string Edition { get; set; }
        public bool EnableDeveloperMode { get; set; }
        public string ContainerFilterScope { get; set; }
        public int MaxAggregatedDataPoints { get; set; }

        public string DefaultTheme { get; set; }
        public string ClickAction { get; set; }
        public string ContextMenuActions { get; set; }
        public string DefaultViewer { get; set; }
        public bool EnablePdfExport { get; set; }
    }
}
