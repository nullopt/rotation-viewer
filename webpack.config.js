const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");

/**
 * @type {import("webpack").Configuration}
 */
module.exports = {
    context: path.resolve(__dirname, "src"),
    plugins: [
        new MiniCssExtractPlugin({
            filename: "[name].css",
        }),
        new CopyPlugin({
            patterns: [
                { from: "index.html", to: "index.html" },
                { from: "appconfig.json", to: "appconfig.json" },
            ],
        }),
    ],
    entry: {
        main: "./index.tsx",
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        library: { type: "umd", name: "Alt1Libs" },
        clean: true,
    },
    devtool: "source-map",
    mode: "development",
    externals: ["sharp", "canvas", "electron/common"],
    resolve: {
        extensions: [".wasm", ".tsx", ".ts", ".mjs", ".jsx", ".js"],
    },
    module: {
        rules: [
            { test: /\.tsx?$/, loader: "ts-loader" },
            { test: /\.css$/, use: [MiniCssExtractPlugin.loader, "css-loader"] },
            {
                test: /\.scss$/,
                use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
            },
            {
                test: /\.(png|jpg|jpeg|gif|webp)$/,
                type: "asset/resource",
                generator: { filename: "[base]" },
            },
            {
                test: /\.(html|json)$/,
                type: "asset/resource",
                generator: { filename: "[base]" },
            },
            {
                test: /\.data\.png$/,
                loader: "alt1/imagedata-loader",
                type: "javascript/auto",
            },
            { test: /\.fontmeta.json/, loader: "alt1/font-loader" },
        ],
    },
    devServer: {
        static: {
            directory: path.resolve(__dirname, "dist"),
        },
        compress: true,
        port: 8080,
        hot: true,
    },
};
