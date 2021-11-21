/* eslint-env node */
const CopyWebpackPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const webpack = require("webpack");
const path = require("path");

const BUILD_DIR = path.resolve(__dirname, "build");
const PUBLIC_DIR = path.resolve(BUILD_DIR, "public");
const SRC_DIR = path.resolve(__dirname, "src");
const NODE_MODULES_DIR = path.resolve(__dirname, "node_modules");
const APP_ENV = process.env.APP_ENV || "production";
let indexPath = "index.jsx";
switch (APP_ENV) {
    case "dev":
        indexPath = "index_dev.jsx";
        break;
    case "staging":
        indexPath = "index_staging.jsx";
        break;
    case "test":
        indexPath = "index_test.jsx";
        break;
}


const withSourceMap = function(url) {
    const loader = {
        loader: url,
        options: {}
    }
    if (APP_ENV === 'production')
        loader.options.sourceMap = true;
    return loader;
};

//we collect static files from various places
const staticPaths = ["web/static/"];
const copyPlugins = staticPaths.map(function(path) {
    return new CopyWebpackPlugin({patterns: [
        {
            from: path,
            to: "../",
            toType: "dir",
        }
    ]});
});

let config = {
    target: "web",
    context: SRC_DIR,
    resolve: {
        symlinks: false,
        extensions: [
            // if an import has no file ending, they will be resolved in this order
            ".tsx",
            ".ts",
            ".jsx",
            ".js"
        ],
        modules: [SRC_DIR, NODE_MODULES_DIR]
    },
    entry: {
        [`app`]: SRC_DIR + `/web/${indexPath}`
    },
    module: {
        rules: [
            // make sure the CSS rules are the first two rules, as we replace
            // them below for the production config
            // BEGIN(CSS) DO NOT MOVE
            {
                test: /\.(scss|sass)$/,
                use: [
                    "style-loader",
                    withSourceMap("css-loader"),
                    withSourceMap("sass-loader")
                ]
            },
            {
                test: /\.css$/,
                use: ["style-loader", withSourceMap("css-loader")]
            },
            // END(CSS) DO NOT MOVE
            {
                test: /\.(png|woff|woff2|eot|ttf|svg)$/,
                use: "file-loader"
            },
            {
                test: /\.(yaml|yml)$/,
                use: ["json-loader", "yaml-loader"]
            },
            {
                test: /\.[tj]sx?$/,
                include: [SRC_DIR],
                use: "babel-loader"
            }
        ]
    },
    output: {
        path: PUBLIC_DIR,
        filename: "[name].js",
        library: "[name]",
        libraryTarget: "umd",
        publicPath: "/public/"
    },
    plugins: [
        ...copyPlugins,
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: "[name].css",
            chunkFilename: "[id].css"
        })
    ]
};

if (APP_ENV === "production") {
    config = {
        ...config,
        mode: "production",
        plugins: [
            ...config.plugins,
            new webpack.DefinePlugin({
                "process.env.NODE_ENV": JSON.stringify("production"),
                COMMIT_SHA: JSON.stringify(
                    process.env.CI_COMMIT_SHA ||
                        process.env.COMMIT_SHA ||
                        "unknown"
                )
            })
        ],
        module: {
            ...config.module,
            rules: [
                // make sure the CSS rules are the first two
                {
                    test: /\.(scss|sass)$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        withSourceMap("css-loader"),
                        withSourceMap("sass-loader")
                    ]
                },
                {
                    test: /\.css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        withSourceMap("css-loader")
                    ]
                },
                ...config.module.rules.slice(2)
            ]
        }
    };
} else {
    config = {
        ...config,
        mode: "development",
        devtool: "cheap-module-source-map",
        devServer: {
            // enable Hot Module Replacement on the server
            host: '0.0.0.0',
            // match the output `publicPath`
            static: {
                publicPath: "/",
                directory: path.join(process.cwd(), "src/web/static"),
            },
            //always render index.html if the document does not exist (we need this for correct routing)
            historyApiFallback: true,

            proxy: {
                "/api": {
                    target: "http://localhost:8888/",
                    secure: false
                }
            },
            // we enable CORS requests (useful for testing)
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods":
                    "GET, POST, PUT, DELETE, PATCH, OPTIONS",
                "Access-Control-Allow-Headers":
                    "X-Requested-With, content-type, Authorization"
            }
        },
        plugins: [
            ...config.plugins,
            new webpack.HotModuleReplacementPlugin(),
            new webpack.DefinePlugin({
                "process.env.NODE_ENV": '"development"',
                COMMIT_SHA: JSON.stringify(
                    process.env.CI_COMMIT_SHA ||
                        process.env.COMMIT_SHA ||
                        "unknown"
                )
            })
            //new BundleAnalyzerPlugin()
        ]
    };
}

module.exports = config;
