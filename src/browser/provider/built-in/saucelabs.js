import SauceLabsConnector from 'saucelabs-connector';
import parseCapabilities from 'desired-capabilities';
import requestAPI from 'request';
import Promise from 'pinkie';
import { flatten, find, assign } from 'lodash';
import promisify from '../../../utils/promisify';


const SAUCE_LABS_REQUESTED_MACHINES_COUNT      = 1;
const WAIT_FOR_FREE_MACHINES_REQUEST_INTERVAL  = 60000;
const WAIT_FOR_FREE_MACHINES_MAX_ATTEMPT_COUNT = 45;

const AUTOMATION_APIS = ['selenium', 'appium', 'selendroid'];

const MAC_OS_MAP = {
    'OS X El Capitan':    'OS X 10.11',
    'OS X Yosemite':      'OS X 10.10',
    'OS X Mavericks':     'OS X 10.9',
    'OS X Mountain Lion': 'OS X 10.8'
};

const request    = promisify(requestAPI, Promise);
const screenshot = promisify((browser, path, cb) => browser.saveScreenshot(path, cb));
const resize     = promisify((browser, width, height, cb) => browser.setWindowSize(width, height, cb));

const formatAssetPart    = str => str.toLowerCase().replace(/[\s.]/g, '-');
const getAssetNameEnding = (part1, part2) => part1 && part2 ? formatAssetPart(part1 + '_' + part2) : '';
const getAssetName       = (automationApi, ...args) => `${automationApi}_${getAssetNameEnding(...args)}`;
const getAssetUrl        = (...args) => `https://wiki-assets.saucelabs.com/data/${getAssetName(...args)}.json`;

const isSelenium   = platformInfo => platformInfo.automationApi === 'selenium';
const isAppium     = platformInfo => platformInfo.automationApi === 'appium';
const isSelendroid = platformInfo => platformInfo.automationApi === 'selendroid';

async function fetchAsset (assetNameParts) {
    var url      = getAssetUrl(...assetNameParts);
    var response = await request(url);

    try {
        return JSON.parse(response.body);
    }
    catch (e) {
        return null;
    }
}

function unfoldTreeNode (node, level = Infinity) {
    if (!node)
        return [];

    var unfoldedChildren = node.list && level > 0 ?
                           flatten(node.list.map(child => unfoldTreeNode(child, level - 1))) :
                           [node.list ? node.list : []];

    return unfoldedChildren.map(child => [node.name].concat(child));
}

async function getAssetData (assetNameParts, unfoldingLevel = Infinity) {
    var assetDataTree = await fetchAsset(assetNameParts);

    if (!assetDataTree)
        return [];

    return unfoldTreeNode(assetDataTree, unfoldingLevel);
}

async function getDeviceData (automationApi, automationApiData) {
    var assetNamePart1 = automationApi === 'selenium' ? automationApiData[2] : automationApiData[1];
    var assetNamePart2 = automationApi === 'selenium' ? automationApiData[4] : automationApiData[2];

    return await getAssetData([automationApi, assetNamePart1, assetNamePart2], 2);
}

function concatDeviceData (automationApiData, devicesData) {
    return devicesData.map(data => automationApiData.concat(data));
}

function formatAutomationApiData (automationApi, automationApiData) {
    var formattedData = {
        automationApi: automationApi,
        platformGroup: automationApiData[1],
        device:        automationApiData[2]
    };

    if (isSelenium(formattedData)) {
        formattedData.os             = automationApiData[4];
        formattedData.browserName    = automationApiData[6];
        formattedData.browserVersion = automationApiData[7];

        if (formattedData.browserName === 'MS Edge')
            formattedData.browserName = 'MicrosoftEdge';

        if (MAC_OS_MAP[formattedData.os])
            formattedData.os = MAC_OS_MAP[formattedData.os];
    }
    else {
        formattedData.os  = automationApiData[5];
        formattedData.api = find(automationApiData, item => item && item.api).api;

        var isAndroidJellyBean   = formattedData.platformGroup === 'Android' && parseFloat(formattedData.os) >= 4.4;
        var isUnsupportedAndroid = isAndroidJellyBean ? isSelendroid(formattedData) : isAppium(formattedData);

        if (isUnsupportedAndroid)
            return null;
    }

    return formattedData;
}

async function getAutomationApiInfo (automationApi) {
    var automationApiData = await getAssetData([automationApi]);

    var devicesData = await Promise.all(automationApiData.map(data => getDeviceData(automationApi, data)));

    automationApiData = automationApiData
        .map((data, index) => concatDeviceData(data, devicesData[index]))
        .filter(data => data.length);

    automationApiData = flatten(automationApiData);

    return automationApiData
        .map(data => formatAutomationApiData(automationApi, data))
        .filter(data => data);
}

export default {
    connectorPromise: Promise.resolve(null),
    openedBrowsers:   {},
    aliasesCache:     [],
    platformsInfo:    [],
    availableAliases: [],

    isMultiBrowser: true,

    _getConnector () {
        this.connectorPromise = new Promise(async resolve => {
            var connector = await this.connectorPromise;

            if (!connector) {
                connector = new SauceLabsConnector(process.env['SAUCE_USERNAME'], process.env['SAUCE_ACCESS_KEY'], {
                    connectorLogging: false
                });

                await connector.connect();
            }

            resolve(connector);
        });

        return this.connectorPromise;
    },

    _disposeConnector () {
        this.connectorPromise = new Promise(async resolve => {
            var connector = await this.connectorPromise;

            if (connector)
                await connector.disconnect();

            resolve(null);
        });

        return this.connectorPromise;
    },

    async _fetchPlatformInfoAndAliases () {
        var automationApiInfoPromises = AUTOMATION_APIS.map(automationApi => getAutomationApiInfo(automationApi));
        var platformsInfo             = await Promise.all(automationApiInfoPromises);

        this.platformsInfo = flatten(platformsInfo);

        var unstructuredBrowserNames = this.platformsInfo
            .map(platformInfo => this._createAliasesForPlatformInfo(platformInfo));

        this.availableBrowserNames = flatten(unstructuredBrowserNames);
    },

    _createAliasesForPlatformInfo (platformInfo) {
        if (platformInfo.device === 'Android Emulator') {
            return [
                this._createAliasesForPlatformInfo(assign({}, platformInfo, { device: 'Android Emulator Tablet' })),
                this._createAliasesForPlatformInfo(assign({}, platformInfo, { device: 'Android Emulator Phone' }))
            ];
        }

        var name     = isSelenium(platformInfo) ? platformInfo.browserName : platformInfo.device;
        var version  = isSelenium(platformInfo) ? platformInfo.browserVersion : platformInfo.os;
        var platform = isSelenium(platformInfo) ? platformInfo['os'] : '';

        if (platformInfo.automationApi === 'appium' && platformInfo.platformGroup === 'Android')
            name += ' Appium';

        return `${name}@${version}${platform ? ':' + platform : ''}`;
    },

    _createQuery (capabilities) {
        var { browserName, browserVersion, platform } = parseCapabilities(capabilities)[0];

        var query = {
            name:     browserName.toLowerCase(),
            version:  browserVersion.toLowerCase(),
            platform: platform.toLowerCase()
        };

        if (/appium$/.test(query.name)) {
            query.useAppium = true;
            query.name      = query.name.replace(' appium', '');
        }

        if (/^android emulator/.test(query.name)) {
            query.deviceType = query.name.replace('android emulator ', '');
            query.name       = 'android emulator';
        }

        return query;
    },

    _filterPlatformInfo (query) {
        return this.platformsInfo
            .filter(info => {
                var browserNameMatched = info.browserName && info.browserName.toLowerCase() === query.name;
                var deviceNameMatched  = info.device && info.device.toLowerCase() === query.name;

                var browserVersionMatched = info.browserVersion === query.version ||
                                            info.browserVersion === query.version + '.0';

                var platformVersionMatched = info.os === query.version;
                var platformNameMatched    = info.os.toLowerCase() === query.platform;

                var isAnyVersion  = query.version === 'any';
                var isAnyPlatform = query.platform === 'any';

                var isAndroidOnAppium = info.automationApi === 'appium' && info.platformGroup === 'Android';

                var desktopBrowserMatched = browserNameMatched &&
                                            (browserVersionMatched || isAnyVersion) &&
                                            (platformNameMatched || isAnyPlatform);

                var mobileBrowserMatched = deviceNameMatched &&
                                           (platformVersionMatched || isAnyVersion) &&
                                           (query.useAppium || !isAndroidOnAppium);

                return desktopBrowserMatched || mobileBrowserMatched;
            });
    },

    _generateMobileCapabilities (query, platformInfo) {
        var capabilities = { deviceName: platformInfo.device };

        if (query.useAppium || platformInfo.platformGroup === 'iOS') {
            capabilities.browserName  = platformInfo.platformGroup === 'iOS' ? 'Safari' : 'Browser';
            capabilities.platformName = platformInfo.platformGroup;
        }
        else {
            capabilities.browserName  = platformInfo.platformGroup;
            capabilities.platformName = platformInfo.api;
        }

        if (query.version !== 'any')
            capabilities.platformVersion = query.version;

        if (query.deviceType)
            capabilities.deviceType = query.deviceType;

        return capabilities;
    },

    _generateDesktopCapabilities (query) {
        var capabilities = { browserName: query.name };

        if (query.version !== 'any')
            capabilities.version = query.version;

        if (query.platform !== 'any')
            capabilities.platform = query.platform;

        return capabilities;
    },

    _generateCapabilities (browserName) {
        var query        = this._createQuery(browserName);
        var platformInfo = this._filterPlatformInfo(query)[0];

        return platformInfo.platformGroup === 'Desktop' ?
               this._generateDesktopCapabilities(query) :
               this._generateMobileCapabilities(query, platformInfo);
    },


    // API
    async init () {
        await this._fetchPlatformInfoAndAliases();
    },

    async dispose () {
        await this._disposeConnector();
    },

    async openBrowser (id, alias, startPage) {
        var capabilities = this._generateCapabilities(alias);
        var connector    = await this._getConnector();

        await connector.waitForFreeMachines(
            SAUCE_LABS_REQUESTED_MACHINES_COUNT,
            WAIT_FOR_FREE_MACHINES_REQUEST_INTERVAL,
            WAIT_FOR_FREE_MACHINES_MAX_ATTEMPT_COUNT
        );

        var newBrowser = await connector.startBrowser(capabilities, startPage);

        this.openedBrowsers[id] = newBrowser;

        var sessionUrl = await connector.getSessionUrl(newBrowser);

        this.setUserAgentMetaInfo(id, `${sessionUrl}`);
    },

    async closeBrowser (id) {
        var connector = await this._getConnector();

        await connector.stopBrowser(this.openedBrowsers[id]);

        delete this.openedBrowsers[id];
    },

    async isValidBrowserName (browserName) {
        return parseCapabilities(browserName).length === 1 &&
               this._filterPlatformInfo(this._createQuery(browserName)).length;
    },

    async getBrowserList () {
        return this.availableBrowserNames;
    },

    async resizeWindow (id, pageInfo, width, height) {
        await resize(this.openedBrowsers[id], width, height);
    },

    async takeScreenshot (id, pageInfo, screenshotPath) {
        await screenshot(this.openedBrowsers[id], screenshotPath);
    }
};
