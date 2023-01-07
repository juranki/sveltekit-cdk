const projen = require("projen");
const { awscdk, typescript, javascript, } = projen;

const packageManager = javascript.NodePackageManager.NPM
const authorName = "Juhani Ränkimies";
const authorEmail = "juhani@juranki.com";
const cdkVersion = "2.59.0";
const defaultReleaseBranch = "main";
const minNodeVersion = "16.19.0";
const constructsName = "@sveltekit-cdk/constructs";
const adapterName = "@sveltekit-cdk/adapter";
const artifactName = "@sveltekit-cdk/artifact";
const nameToPath = (n) => `packages/${n}`;

// root of the monorepo
const root = new javascript.NodeProject({
  defaultReleaseBranch,
  name: "root",
  jest: false,
  devDeps: ["nx"],
  packageManager,
});
root.package.addField("private", true);
root.package.addField("workspaces", ["packages/@sveltekit-cdk/*"]);
root.package.setScript("build", "nx run-many --target=build");
root.synth();

// @sveltekit-cdk/artifact
const artifact = new typescript.TypeScriptProject({
  minNodeVersion,
  authorName,
  authorEmail,
  parent: root,
  outdir: nameToPath(artifactName),
  name: artifactName,
  defaultReleaseBranch,
  packageManager,
});
artifact.synth();

// @sveltekit-cdk/constructs
const constructs = new awscdk.AwsCdkConstructLibrary({
  author: authorName,
  authorAddress: authorEmail,
  cdkVersion,
  defaultReleaseBranch,
  parent: root,
  outdir: nameToPath(constructsName),
  name: constructsName,
  repositoryUrl: "git@github.com:juranki/sveltekit-cdk.git",
  description:
    "CDKv2 construct for deploying SvelteKit site to AWS CloudFront and Lambda@Edge",
  minNodeVersion,
  devDeps: ["@types/aws-lambda"],
  bundledDeps: ["@sveltekit-cdk/artifact"],
  stability: "experimental",
  packageManager,
});
constructs.package.addField("jsii", {
  excludeTypescript: ["test"],
  tsc: {
    outDir: "lib",
    rootDir: "src",
    types: ["node", "aws-lambda"],
  },
  outdir: "dist",
  versionFormat: "full",
  targets: []
});
constructs.synth();

// @sveltekit-cdk/adapter
const adapter = new typescript.TypeScriptProject({
  minNodeVersion,
  authorName,
  authorEmail,
  parent: root,
  outdir: nameToPath(adapterName),
  name: adapterName,
  defaultReleaseBranch,
  allowLibraryDependencies: true,
  peerDependencyOptions: {
    pinnedDevDependency: true,
  },
  peerDeps: ["@sveltejs/kit"],
  devDeps: ["@types/estree", "svelte", "vite", "undici", "@types/aws-lambda"],
  deps: ["esbuild", "@sveltekit-cdk/artifact"],
  tsconfig: {
    compilerOptions: {
      lib: ["esNext", "DOM"],
      target: "es2022",
      module: "es2022",
      moduleResolution: "node",
    },
  },
});
adapter.package.addField("type", "module");
adapter.synth();

