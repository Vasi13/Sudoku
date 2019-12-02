using System.Web;
using System.Web.Optimization;

namespace sudoku1
{
    public class BundleConfig
    {
        // For more information on bundling, visit https://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/js/plugins")
                .Include(
                       "~/Scripts/angular.min.js",
                       "~/Scripts/angular-route.min.js",
                       "~/Scripts/angular-animate.min.js",
                       "~/Scripts/angular-aria.min.js",
                       "~/Scripts/angular-messages.min.js",
                       "~/Scripts/angular-material.min.js",                      
                       "~/Scripts/bootstrap.min.js",
                       "~/Scripts/flickity.pkgd.min.js",
                        "~/Scripts/jquery-{version}.js",
                        "~/Scripts/jquery.validate*",
                        "~/Scripts/modernizr-*",
                      "~/Scripts/respond.min.js",
                      "~/Scripts/svg-assets-cache.js"
                      ));
            bundles.Add(new StyleBundle("~/css/app")
                .Include(
                      "~/Content/bootstrap.min.css",
                      "~/Content/site.css",
                      "~/Content/angular-material.min.css",
                      "~/Assets/css/pagestyle.css",
                      "~/Assets/css/flickity.min.css",
                      "~/Assets/css/cardCarousel.css",
                      "~/Assets/css/font-awesome.min.css"));

            bundles.Add(new ScriptBundle("~/js/angularApp")
                .Include("~/app/app.js")
                .IncludeDirectory("~/app/controllers", "*.js")
                .IncludeDirectory("~/app/data", "*.js")
                .IncludeDirectory("~/app/directives", "*.js")
                .IncludeDirectory("~/app/filters", "*.js")
                .IncludeDirectory("~/app/services/", "*.js"));
            bundles.Add(new StyleBundle("~/css/angularApp")
                .Include("~/Assets/css/angularsud.css"));


            bundles.Add(new ScriptBundle("~/js/jquerryApp")
                .Include("~/app/notAngular/jquerrysud.js"));
            bundles.Add(new StyleBundle("~/css/jquerryApp")
                .Include("~/Assets/css/jquerrysud.css"));
        }
    }
}
