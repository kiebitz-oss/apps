[English version](README.md) // [Deutsche Version](README-de.md)


# Kiebitz - Privacy Friendly Appointment Scheduling</md-list>

<img src="/materials/images/kiebitz-1.png" alt="Kiebitz - Logo" title="Kiebitz - Logo" width="40%" />

Welcome to the Kiebitz project! Please visit our [website](https://kiebitz.eu) to learn more about us.

# Getting Started

Kiebietz consists of three apps for providers, mediators and users, which can be reached under `/provider`, `/mediator` and `/user`, respectively. The app can be built with different environments:

* The `dev` environment works against a locally deployed backend and is great for testing the apps against a real backend.
* The `production` environment build the app bundles for production deployment, i.e. minified and optimized code that works against the production backend.

To run the app in dev mode, simply run

```bash
npm run-script make-dev
``` 

after running `npm install`. To build the `dev` and `production` versions simply run

```bash
# build the development version
npm run-script make-dev
# build the production version
npm run-script make
```

# Linting & Formatting

We use `eslint` and `prettier` for linting and formatting of code. To lint code, run

```bash
# just lint
npm run-script lint
# lint and autofix where possible
npm run-script lint-fix
# lint SCSS
npm run-script lint-scss
# lint and fix SCSS where possible
npm run-script lint-scss-fix
# format code
npm run-script prettier
```

# Analyzing Bundle Size

You can run the bundle size analyzer (which helps you to identify packages and assets taking up a lot of space in the bunde) via

```bash
npm run-script analyze
```

# Licenses

The Kiebitz software code is licensed under Affero GPL version 3 (AGPL-3.0). Please see the [license file for](LICENSE) more information. The license was chosen to ensure that any changes to Kiebitz will benefit the community.

Documentation is licensed under the [Creative Commons - Attribution ShareAlike 4.0 International](https://creativecommons.org/licenses/by-sa/4.0/) license. Please see the [license file for](DOCS-LICENSE) more information (translated license texts can be found at the link above).</md-list>

# Feedback

If you have any questions [just contact us](mailto:kontakt@kiebitz.eu).

# Participation

We are happy about your contribution to the project! In order to ensure compliance with the licensing conditions and the future development of the project, we require a signed declaration of consent for all contributions in accordance with the [Harmony standard](http://selector.harmonyagreements.org). Please sign the corresponding document for [natural persons](.clas/Kiebitz-Individual.pdf) or for [organizations](.clas/Kiebitz-Entity.pdf) and send it to [us](mailto:kontakt@kiebitz.eu).

## Third-Party Assets

We use the following third-party libraries and assets directly in this codebase (in addition to the ones specified in `package.json` and `requirements.txt`):

* [Bulma](https://github.com/jgthms/bulma)
* [Font Awesome](https://github.com/FortAwesome/Font-Awesome)
* [Open Sans](https://github.com/googlefonts/opensans)
* [Oxanium](https://github.com/sevmeyer/oxanium)
* [Source Code Pro](https://github.com/adobe-fonts/source-code-pro)

## Security

Did you find a security issue you'd like to report? Please contact us at [security@kiebitz.eu](mailto:security@kiebitz.eu). We appreciate if you follow [responsible disclosure practices](https://en.wikipedia.org/wiki/Responsible_disclosure).
**Please do not create a public Github issue for exploitable vulnerabilities that you've identified**. We do not have a formal bug bounty program in place but will try to reward researchers for significant security findings. We also pledge to never take any kind of legal action or retaliate against researchers that disclose security issues in good faith. You may of course disclose issues anonymously as well.
