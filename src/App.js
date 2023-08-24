import React, { Component } from "react";
import Pipeline from "@pipeline-ui-2/pipeline"; //change to import Pipeline from 'Pipeline for realtime editing Pipeline index.js, and dependency to: "Pipeline": "file:..",

import { sendTxns } from "@pipeline-ui-2/pipeline/utils";
import algosdk from "algosdk";
import CopyPasteText from "./copy-paste";

import { Svg1, Svg2, Svg3, Svg4, Svg5, Svg6, Svg7, Svg8, Svg9, Svg10, Svg11, Svg12, Svg13, Svg14, Svg15, Svg16, Svg17, Svg18, Svg19, Svg20, Svg21, Svg22, Svg23, Svg24, Svg25, Svg26, Svg27, Svg28, Svg29, Svg30, Svg31, Svg32, Svg33, Svg34, Svg35, Svg36 } from './svgs.js'

var asset = parseInt(71185554);
var refresh = false;
var ready = false;
var mynet = (Pipeline.main) ? "MainNet🔴" : "TestNet🚧";
const myAlgoWallet = Pipeline.init();
Pipeline.main = true;
const tealNames = ["daoDeposit"];
function toggle(id = "", on = true) {
  if (on) {
    document.getElementById(id).style.display = "block";
  } else {
    document.getElementById(id).style.display = "none";
  }
}
function toggleFlex(id = "", on = true) {
  if (on) {
    document.getElementById(id).style.display = "flex";
  } else {
    document.getElementById(id).style.display = "none";
  }
}

var logText = ""
var burnText = ""

async function getZeros(asa) {
  let url = "https://algoindexer.algoexplorerapi.io/v2/assets/" + asa;
  let data = await fetch(url);
  let dataJSON = await data.json();
  let zeros = dataJSON.asset.params.decimals;
  let factor = "1";
  for (let i = 0; i < zeros; i++) {
    factor += "0";
  }
  return parseInt (factor)
}

function log(text, color = "yellow") {
  logText += '<p style="color:' + color + '">' + text + "</p>"
  document.getElementById("myLog22").innerHTML = logText
}

const tealContracts = {
  daoDeposit: {},
};
async function getContracts() {
  for (let i = 0; i < tealNames.length; i++) {
    let name = tealNames[i];
    let data = await fetch("teal/" + name + ".txt");
    tealContracts[name].program = await data.text();
    let data2 = await fetch("teal/" + name + " clear.txt");
    tealContracts[name].clearProgram = await data2.text();
  }
}
var dark = true;

function toggleMode() {
  dark = !dark;
  if (dark) {
    document.getElementById("sun").style.display = "block";
    document.getElementById("moon").style.display = "none";
  } else {
    document.getElementById("sun").style.display = "none";
    document.getElementById("moon").style.display = "block";
  }
  var element = document.body;
  element.classList.toggle("light");
}


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      net: mynet,
      txID: "",
      myAddress: "",
      burnProof: "",
      burnProof2: "",
      balance: 0,
      appAddress: "",
      goal: 0,
      level: 0,
      fundAmount: "Not fetched yet...",
      share: 0,
      depositAmount: 0,
      myProfits: 0,
      withdrawn: 0,
      contribution: 0,
      staked: 0,
      rewards: 0,
      stakedRound: 0,
      currentRound: 0,
      myAsaBalance: "Not fetched yet...",
      progress: "",
    };
  }

  componentDidMount() {
    getContracts();
    toggle("slider", false);
    toggleFlex("slider-2", true);
    toggle("log", false);
    toggle("log-2", true);
  }

  fetchBalance = (addr) => {
    Pipeline.balance(addr).then((data) => {
      this.setState({ balance: data });
    });
  };

  setNet = (event) => {
    if (event.target.value === "Mainnet") {
      Pipeline.main = true;
      this.setState({ net: "TestNet" });
    } else {
      Pipeline.main = false
      this.setState({ net: "Testnet" });
    }
  };

  handleConnect = () => {
    toggle("slider", true);
    toggle("slider-2", false);
    Pipeline.connect(myAlgoWallet).then((data) => {
      this.setState({ myAddress: data });
      setInterval(() => this.fetchBalance(this.state.myAddress), 5000);
      document.getElementById("wallet-connect-2").style.display = "none";
      document.getElementById("wallet-connected").style.display = "block";
      log("Connected Address: " + data)
      toggle("slider", false);
      toggleFlex("slider-2", true);
      toggle("loaded", false);
      toggle("wallet-loaded", true);
      toggle("modal-root-1", false);
    });
  };

  switchConnector = (event) => {
    Pipeline.pipeConnector = event.target.value;
    console.log(Pipeline.pipeConnector);
  };

  deploy = async () => {
    toggle("slider-4", true);
    toggle("verify-label-1", false);
    let name = "daoDeposit";
    Pipeline.deployTeal(
      tealContracts[name].program,
      tealContracts[name].clearProgram,
      [1, 1, 3, 6],
      ["create"]
    ).then((data) => {
      document.getElementById("appid").value = data;
      this.setState({ appAddress: algosdk.getApplicationAddress(data) });
      toggle("slider-4", false);
      toggleFlex("token-verified", true);
      toggleFlex("token-verification", false);
      log("App deployed")
      log("App ID = " + data)
    });
  };

  delete = async () => {
    toggle("slider-32", true);
    toggle("verify-label-22", false);
    Pipeline.deleteApp(document.getElementById("appid").value).then((data) => {
      this.setState({ txID: data });
      this.setState({ burnProof: data });
      toggle("slider-32", false);
      toggle("badge-verification-2", false);
      toggle("burn-wrapper", true);
      toggleFlex("badge-verified-2", true);
      log("App Deleted. Assets received by app = Destroyed.")
      log("Txid: " + data)
    });
  };

  clear = async () => {
    let transServer = "https://node.testnet.algoexplorerapi.io/v2/transactions";
    if (Pipeline.main === true) {
      transServer = "https://node.algoexplorerapi.io/v2/transactions";
    }
    let params = await Pipeline.getParams();
    let appId = parseInt(document.getElementById("appid").value);
    let txn = algosdk.makeApplicationClearStateTxn(
      this.state.myAddress,
      params,
      appId
    );
    let signedTxn = await Pipeline.sign(txn, false);
    let txid = await sendTxns(signedTxn, transServer, false, "", true);
    this.setState({ txID: txid });
    log("Opted Out")
    log("Txid: " + txid)
  };

  fundingLevel = async () => {
    let appId = document.getElementById("appid").value;
    let appAddress = algosdk.getApplicationAddress(parseInt(appId));
    this.setState({ appAddress: appAddress });
    let balance = await Pipeline.balance(appAddress);
    this.setState({ level: (balance / (this.state.goal / 1000000)) * 100 });
    this.setState({ fundAmount: balance });
    this.readLocalState(Pipeline.main, this.state.myAddress, appId).then(
      () => { }
    );
  };
  optIn = async () => {
    let appId = document.getElementById("appid").value;
    this.state.appAddress = algosdk.getApplicationAddress(parseInt(appId));
    let args = [];
    args.push("register");
    Pipeline.optIn(appId, args).then((data) => {
      this.setState({ txID: data });
      log("Opted in")
      log("Txid: " + data);
      setInterval(() => this.fundingLevel(), 5000);
      
    });
  };
  withdraw = async () => {
    let appId = document.getElementById("appid").value;
    let appAddress = algosdk.getApplicationAddress(parseInt(appId));
    Pipeline.appCall(appId, ["withdraw"], [appAddress], [asset]).then(
      (data) => {
        this.setState({ txID: data });
      }
    );
  };
  redeem = async () => {
    let appId = document.getElementById("appid").value;
    let amount = parseInt(document.getElementById("fundAmt").value);
    let appAddress = algosdk.getApplicationAddress(parseInt(appId));
    Pipeline.appCall(appId, ["redeem"], [appAddress], [asset]).then((data) => {
      this.setState({ txID: data });
    });
  };
  salvage = async () => {
    let appId = document.getElementById("appid").value;
    let appAddress = algosdk.getApplicationAddress(parseInt(appId));
    Pipeline.appCall(appId, ["salvage"], [appAddress], [asset]).then((data) => {
      this.setState({ txID: data });
    });
  };
  fund = async () => {
    let appId = document.getElementById("appid").value;
    let appAddress = algosdk.getApplicationAddress(parseInt(appId));
    let famt = parseInt(document.getElementById("fundAmt").value);
    Pipeline.appCallWithTxn(
      appId,
      ["fund"],
      appAddress,
      famt,
      "funding",
      asset,
      [appAddress],
      [asset]
    ).then((data) => {
      this.setState({ txID: data });
    });
  };
  addasset = () => {
    let appId = document.getElementById("appid").value;
    let appAddress = algosdk.getApplicationAddress(parseInt(appId));
    toggle("b-5", false);
    toggle("slider-23", true);
    Pipeline.appCall(appId, ["addasset"], [appAddress], [asset]).then(
      (data) => {
        this.setState({ txID: data });
        toggle("slider-23", false);
        toggleFlex("slider-b6", true);
        log("Asset added")
        log("Txid: " + data)
        if (data === undefined) {
          toggle("b-5", true);
          toggleFlex("slider-b6", false);
        }

      }
    );
  };
  deposit = async () => {
    let appId = document.getElementById("appid").value;
    let appAddress = algosdk.getApplicationAddress(parseInt(appId));
    let depositAmt = parseInt(document.getElementById("depAmt").value);
    Pipeline.appCallWithTxn(
      appId,
      ["deposit"],
      appAddress,
      depositAmt,
      "depositing",
      asset,
      [appAddress],
      [asset]
    ).then((data) => {
      this.setState({ txID: data });
      log("Funded")
      log("Txid: " + data);
    });
  };
  modifyTeal = () => {
    let replacement = document.getElementById("asa").value;
    asset = parseInt(replacement);
    
    alert("ASA changed!");
    toggleFlex("b-2", true);
    toggle("b-1", false);
    log("Asset set to " + replacement);
    if (log === undefined) {
      toggle("b-1", true);
      toggleFlex("b-2", false);
    }
  };
  fundApp = () => {
    let amount = parseInt((document.getElementById("sendAlgo").value) * 1000000);
    let appId = document.getElementById("appid").value;
    let appAddress = algosdk.getApplicationAddress(parseInt(appId));
    toggle("b-3", false);
    toggle("slider-b2", true);
    Pipeline.send(appAddress, amount, "burn ASA", undefined, undefined, 0).then(
      (data) => {
        this.setState({ txID: data });
        toggle("slider-b2", false);
        toggleFlex("b-22", true);
        log("Funded")
        log("Txid: " + data)
        if (data === undefined) {
          toggleFlex("b-22", false)
          toggle("b-3", true)
        }
      }
    );
  };
  burn = async () => {
    let zeros = await getZeros(asset)
    let amountb = document.getElementById("depAmt").value * zeros;
    let appId = document.getElementById("appid").value;
    let appAddress = algosdk.getApplicationAddress(parseInt(appId));
    toggle("b-444", false);
    toggle("slider-43", true);
    Pipeline.send(
      appAddress,
      parseInt(amountb),
      "burned ASA",
      undefined,
      undefined,
      asset
    ).then((data) => {
      this.setState({ txID: data });
      this.setState({ burnProof2: data });
      if (data === undefined) {
        toggle("b-444", true);
        toggle("slider-43", false);
        toggle("slider-42", false);
        this.setState({
          progress: "Error occured while trying to burn assset",
        });
      }
      else {
        this.setState({ progress: "Asset " + asset + " has been sent" });
        log("Asset " + asset + " has been sent")
        log("Txid: " + data)
        toggle("slider-43", false);
        toggleFlex("slider-42", true);
      }
    });
  };
  readLocalState = async (net, addr, appIndex) => {
    try {
      let url = "";
      if (!net) {
        url = "https://indexer.testnet.algoexplorerapi.io";
      } else {
        url = "https://algoindexer.algoexplorerapi.io";
      }
      let appData = await fetch(url + "/v2/accounts/" + addr);
      let appJSON = await appData.json();
      appJSON.account.assets.forEach((element) => {
        if (element["asset-id"] === asset) {
          let asaBalance = element.amount;
          this.setState({ myAsaBalance: asaBalance / 1000000 });
        }
      });
      let AppStates = await appJSON.account["apps-local-state"];
      AppStates.forEach((state) => {
        if (state.id === parseInt(appIndex)) {
          let keyvalues = state["key-value"];
          keyvalues.forEach((entry) => {
            switch (entry.key) {
              case "YW10":
                let contribution = entry.value.uint;
                this.setState({ contribution: contribution / 1000000 });
                this.setState({
                  share:
                    parseInt(
                      (contribution / (this.state.staked * 1000000)) * 100
                    ) || 0,
                });
                break;
              case "d2l0aGRyYXdu":
                let withdrawn = entry.value.uint;
                this.setState({ withdrawn: withdrawn || 0 });
                break;
              case "cm91bmQ=":
                let stakedRound = entry.value.uint;
                this.setState({ stakedRound: stakedRound });
                this.setState({ redeamRound: stakedRound + 20 });
                break;
              default:
                break;
            }
          });
        }
      });
    } catch (error) {
      console.log(error);
    }
  };
  startRefresh = () => {
    this.fundingLevel();
    if (!refresh) {
      setInterval(() => this.fundingLevel(), 5000);
    }
    refresh = true;
  };
  render() {
    return (
      <div align="center">
        <div>
          <div className="container">
            <div className="banner">
              AlgoBurner is live on Mainnet.
              <Svg1 />
            </div>
            <header className="header">
              <div className="logo" aria-label="swaplink logo">
                <Svg2 />
                <Svg3 />
              </div>
              <div>
                <div>
                  <button
                    className="btn btn--connect-wallet"
                    id="wallet-connect-2"
                    onClick={() => {
                      document.getElementById("modal-root-1").style.display =
                        "block";
                    }}
                  >
                    <Svg4 />
                    <span className="count__title-2">Connect Wallet</span>
                  </button>
                  <div id="wallet-connected" style={{ display: "none" }}>
                    <div className="actions">
                      <div id="my-balance" className="own-balance">
                        <p>{this.state.balance + " Algo"}</p>
                        <span className="currency" />
                      </div>
                      <div className="dropdown">
                        <button id="own-address" className="own-address">
                          {this.state.myAddress}
                        </button>
                        <div className="dropdown__content">

                            <div className="copyable btn btn--transparent">

                  <CopyPasteText
                    text="copy address"
                    copyText={this.state.myAddress}
                    hideIcon={true}
                  />

                            </div>
                          <a
                            className="btn btn--transparent"
                            id="algoexplorer"
                            target="_blank"
                            rel="noreferrer"
                            href={
                              (Pipeline.main?"https://algoexplorer.io/address/":"https://testnet.algoexplorer.io/address/") +
                              this.state.myAddress
                            }
                          >
                            AlgoExplorer
                            <Svg5 />
                          </a>
                          <button
                            id="disconnect-me"
                            className="btn btn--transparent btn--warning"
                            onClick={() => {
                              window.location.reload(true)
                            }}
                          >
                            Disconnect
                          </button>
                          <button
                  className="btn btn--transparent toggle-net"
                  // defaultChecked={true}
                  onClick={this.setNet}
                  
                >TestNet🚧</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div />
              </div>
            </header>
            <div id="wrapper">
              <div>
                <div id="msg" className="msg msg--success">
                  <div className="copyable">
                    <div className="copyable__text" id="log">
                      Loading contracts...
                    </div>
                    <div
                      className="copyable__text"
                      id="log-2"
                      style={{ display: "none" }}
                    >
                      Burner Contracts loaded
                    </div>
                    <span className="copy" />
                  </div>
                  <button
                    id="msg-close"
                    className="msg__close"
                    onClick={() => {
                      document.getElementById("msg").style.display = "none";
                    }}
                  >
                    <Svg6 />
                  </button>
                </div>
                <div className="app-title">
                  Manage all your NFT burning sessions in one Dapp!
                </div>
              </div>
            </div>
            <div id="dappdiv" className="dapp-form" align="center">
              <div className="flexible-h1">
                <h1 className="bolierplate">ALGOBURNER🔥</h1>
              </div>
              <div>
                <h1 id="dappTitle-2" />
              </div>
              <br />
              <div className="ballot-1">
                <div className="flex">

                  <div className="shoulder__menu">
                    <button
                      id="info"
                      className="shoulder__item"
                      data-bs-toggle="root-modal-5"
                      data-bs-target="#exampleModal"
                      onClick={() => {
                        document.getElementById("modal-root-5").style.display =
                          "block";
                      }}
                    >
                      <Svg7 />
                    </button>
                    <div>
                      <div
                        id="modal-root-5"
                        style={{ display: "none" }}
                        className="fade modal "
                      >
                        <ul>
                          <div className="modal">
                            <div className="modal-content modal-content-size">
                              <div className="modal-topbar">
                                <h2 className="modal-title">ASA + AlgoBurner = 🔥</h2>
                                <button
                                  id="info-close"
                                  className="modal-close"
                                  onClick={() => {
                                    document.getElementById(
                                      "modal-root-5"
                                    ).style.display = "none";
                                  }}
                                >
                                  <Svg8 />
                                </button>
                              </div>
                              <div className="modal-body">
                              <p>
    With AlgoBurner, Algorand DAO managers, NFT creators, and Algorand Standard
    Asset devs can safely and securely dispose of excess fungible and
    non-fungible tokens.
  </p>
  <p>
    Token-burning security should always be viewed from the perspective of the
    consumer. If a token is burned, how can you [prove] to the end user or
    community member that the token was burned?
  </p>
  <p>
    HEADLINE created AlgoBurner to provide the Algorand community with a simple
    burning solution that results in immutable, irrevocable proof that tokens
    were burned forever.
  </p>
  <h3 className="modal-title sh">
    How It Works
    <p>
    In short, burning Dapps "destroy" tokens by sending them (the tokens) to Algorand addresses where the mnemonic password of that address has been rendered unrecoverable. Tokens sent to addresses with no access keys can never be withdrawn or moved by token creators or consumers. Typically, the Algorand addresses used for burning are generated by address creators throwing away the mnemonic password or by on-chain smart contracts called "apps." However, with both of these solutions - how can you [prove] to the end user that the burner address's mnemonic is really lost forever? Typically, it requires the end user to have a working knowledge of TEAL, or for the end user to accept some version of "Trust me bro." With AlgoBurner, ASA burning is finally trustless.
    </p>
    <ol>
      <li>
      Deploy on-chain burning app.
      </li>
      <li>
        Modify web app for the ASA to be burned.
      </li>
      <li>
      Deploy on-chain burning app.
      </li>
      <li>
        Microfund the burning app (we recommend 0.2 - 0.5 Algo)
      </li>
      <li>
      Opt app into ASA that will be burned.
      </li>
      <li>
        Send burning ASAs to the burning app's Algo address.
      </li>
      <li>
      Delete burning app.
      </li>
      <li>
      🔥 Burn Baby Burn 
      </li>
      <p>After deleting the burning app, record the asset transfer transaction and the delete app transaction. Present these two transactions as irrevocable, immutable proof that the tokens were burned forever. </p>

    </ol>
  </h3>
</div>

                            </div>
                          </div>
                        </ul>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        toggleMode()
                      }}
                      id="toggle-css"
                      target="_blank"
                      rel="noreferrer"
                      className="shoulder__item"
                    >
                      <Svg9 />
                      <Svg10 />
                    </button>
                  </div>
                </div>
                <div id="modal-root-4" style={{ display: "none" }}>
                  <div className="modal">
                    <div className="modal-content modal-content-size">
                      <div className="modal-topbar">
                        <h2 className="modal-title">How it works</h2>
                        <button className="modal-close">
                          <Svg11 />
                        </button>
                      </div>
                      <div className="modal-body"> </div>
                    </div>
                  </div>
                </div>
                <a
                  target="_blank"
                  href="https://www.pipeline-ui.com"
                  className="btn btn--connect-wallet"
                  id="wallet-connect"
                >
                  <Svg12 />
                  <span className="count__title"> Learn More</span>
                </a>
                <div
                  id="modal-root-1"
                  className="fade modal"
                  style={{ display: "none" }}
                >
                  <div className="modal-1">
                    <div className="modal-content modal-content-size">
                      <div className="modal-topbar">
                        <h2 className="modal-title">Algo Wallets</h2>
                        <button
                          id="wallet-connect-close"
                          className="modal-close"
                          onClick={() => {
                            document.getElementById(
                              "modal-root-1"
                            ).style.display = "none";
                          }}
                        >
                          <Svg13 />
                        </button>
                      </div>
                      <div className="flex-column">
                        <button
                          id="WalletConnect"
                          className="btn btn--connect-wallet"
                          onClick={() => {
                            Pipeline.pipeConnector = "WalletConnect";
                            this.handleConnect();
                          }}
                        >

                          WalletConnect
                        </button>
                        <button
                          id="AlgoSigner"
                          className="btn btn--connect-wallet"
                          onClick={() => {
                            Pipeline.pipeConnector = "AlgoSigner";
                            this.handleConnect();
                          }}
                        >

                          AlgoSigner
                        </button>
                        <button
                          id="myAlgoWallet"
                          className="btn btn--connect-wallet"
                          onClick={() => {
                            Pipeline.pipeConnector = "myAlgoWallet";
                            this.handleConnect();
                          }}
                        >

                          MyAlgoWallet
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="modal-body" />
                </div>
              </div>
              <div className="dapp-container">

                <div className="dapp-field">
                  <p
                    id="appAddress"
                    className="input input--amount"
                    style={{ display: "none", textAlign: "start" }}
                  >
                    {"Application Address: " + this.state.appAddress}
                  </p>
                  <label className="label dapp-field__label">
                    Burner Address
                  </label>
                  <input
                    className="input input--amount"
                    id="asaAmount"
                    placeholder="🔥✉️ "
                    disabled
                  ></input>
                  <div className="dapp-field__btns-2">
                    <div
                      target="_blank"
                      className="btn btn--connect-wallet"
                      id="slider-2"
                      style={{ display: "none" }}
                    >
                      <Svg14 />
                      <span id="loaded" className="count__title">
                        Loaded
                      </span>
                      <span
                        id="wallet-loaded"
                        className="count__title"
                        style={{ display: "none" }}
                      >
                        Connected
                      </span>
                    </div>
                    <div
                      target="_blank"
                      className="btn btn--connect-wallet"
                      id="token-minted"
                      style={{ display: "none" }}
                    >
                      <Svg15 />
                      <span className="count__title">App Deployed</span>
                    </div>
                    <div
                      id="slider"
                      className="btn btn--change-poll"
                      style={{ display: "block" }}
                    >
                      <div className="waiting-slider waiting-slider--full waiting-slider--helper-blue">
                        <div className="waiting-slider__track" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="dapp-switch">
                  <Svg16 />
                </div>
                <div className="dapp-field">

                  <label className="label dapp-field__label">
                    Burner iD
                  </label>
                  <input
                    className="input input--amount"
                    placeholder="App Id"
                    id="appid"
                    type="number"
                  />
                  <div className="dapp-field__btns">

                    <button
                      className="btn btn--change-poll"
                      id="createAsa"
                      onClick={this.deploy}
                    >
                      1. Deploy Burner App
                    </button>
                  </div>
                </div>
              </div>
              <div>

                <div className="ballot">

                  <div className="footer-top-2">
                    <button
                      id="info-1"
                      className="shoulder__item"
                      data-bs-toggle="root-modal-12"
                      data-bs-target="#exampleModal"
                      onClick={() => {
                        document.getElementById("modal-root-12").style.display =
                          "block";
                      }}
                    >
                      <Svg17 />
                    </button>
                    <span
                      id="token-verification"
                      className="badge jsx-4236559370"
                    >
                      <div id="slider-4" style={{ display: "none" }}>
                        <div className="waiting-slider--full waiting-slider--helper-blue waiting-slider-3">
                          <div className="waiting-slider__track" />
                        </div>
                      </div>
                      <div id="verify-label-1">Burning metadata</div>
                    </span>
                    <span
                      id="token-verified"
                      className="badge badge-2"
                      style={{ display: "none" }}
                    >
                      <div id="verified-label">
                        <Svg18 />
                        <div className="app-verify">App deployed</div>
                      </div>
                    </span>
                    <div
                      id="modal-root-12"
                      style={{ display: "none" }}
                      className="fade modal show"
                    >

                      <ul>
                        <div className="modal">
                          <div className="modal-content modal-content-size">
                            <div className="modal-topbar">
                              <h2 className="modal-title">AlgoBurner Terminology</h2>
                              <button
                                id="info-close-1"
                                className="modal-close"
                                onClick={() => {
                                  document.getElementById(
                                    "modal-root-12"
                                  ).style.display = "none";
                                }}
                              >
                                <Svg19 />
                              </button>
                            </div>
                            <div className="modal-body">
                              <p>
      Here is a collection of common terminology used in the AlgoBurner application. AlgoBurner users are required to set their own burner values in the burning smart contract.
                              </p>
                              <ol>
                                <li>
                                Burner Address: Algorand address that corresponds to the deployed TEAL app and is fully controlled by the app via TEAL 5 inner transactions. The  asa is sent to this address. Since no TEAL is provided to withdraw from the app Address, the funds are permanently locked.
                                </li>
                                <li>
                                Burner Id: The index of the deployed app. This number alone is all that is required to generate the application address above using the algosdk.
                                </li>
                                <li>
                                ASA#: The index number of the asset that you wish to delete. After pasting in this value, click "Modify ASA" to hard-code the asset id into the contract.
                                </li>
                                <li>
                                Micro Fund: The application address needs a small amount of Algo to opt in to the asset
                                </li>
                                <li>
                                Opt-in: Opt the application address into the asset to be burned after micro-funding
                                </li>
                                <li>
                                Send assets: transfer the asset to be burned to the app.
                                </li>
                                <li>
                                Burn Baby Burn (Delete app): Algorand permits only 10 apps per account. To avoid future app creation failure, don't forget to delete the app!
                                </li>
                              </ol>
                            </div>
                          </div>
                        </div>
                      </ul>
                    </div>
                  </div>
                  <div
                    id="options-div"
                    className="options-div"
                    style={{ display: "block" }}
                  >
                    <button
                      className="btn btn--generate-link"
                      id="options-btn"
                      data-bs-toggle="modal"
                      data-bs-target="#exampleModal"
                      onClick={() => {
                        document.getElementById("modal-root-3").style.display =
                          "block";
                        document.getElementById("options-btn").style.display =
                          "none";
                      }}
                    >
                      <span className="options__title">Burn options</span>
                      <Svg20 />
                    </button>
                  </div>
                  <div
                    id="modal-root-3"
                    className="modal-root-3 "
                    style={{ display: "none" }}
                  >
                    <div className="modal-topbar">
                      <h2 id="dappTitle-3" className="modal-title">
                        Burner Options
                      </h2>
                      <button
                        id="options-close"
                        className="modal-close"
                        onClick={() => {
                          document.getElementById(
                            "modal-root-3"
                          ).style.display = "none";
                          document.getElementById("options-btn").style.display =
                            "block";
                        }}
                      >
                        <Svg21 />
                      </button>
                    </div>
                    <div className="dapp-container">
                      <div className="dapp-field">
                        <label className="label dapp-field__label">
                          Change ASA iD
                        </label>
                        <input
                          autoComplete="false"
                          className="input input--amount"
                          id="asa"
                          type="number"
                          placeholder="ASA#"
                          required
                        ></input>
                        <div className="dapp-field__btns">

                          <div
                            target="_blank"
                            className="btn btn--connect-wallet"
                            id="b-2"
                            style={{ display: "none" }}
                          >
                            <Svg22 />
                            <span id="b-2" className="count__title">
                              Modified
                            </span>
                          </div>
                          <button id="b-1"
                            className="btn btn--change-poll"
                            onClick={this.modifyTeal}
                          >
                           2. Modify ASA iD
                          </button>
                          <div
                            id="slider-21"
                            className="btn btn--change-poll"
                            style={{ display: "none" }}
                          >
                            <div className="waiting-slider waiting-slider--full waiting-slider--helper-blue">
                              <div className="waiting-slider__track" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="dapp-field">
                        <label className="label dapp-field__label">
                          Fund App
                        </label>
                        <input
                          autoComplete="false"
                          value={.5}
                          className="input input--amount"
                          id="sendAlgo"
                          type="number"
                          placeholder="microAlgos"
                          required
                          readOnly={true}
                          disabled="true"
                        ></input>
                        <div className="dapp-field__btns">
                          <div
                            target="_blank"
                            className="btn btn--connect-wallet"
                            id="b-22"
                            style={{ display: "none" }}
                          >
                            <Svg23 />
                            <span id="b-4" className="count__title">
                              Funded
                            </span>
                          </div>
                          <button
                            id="b-3"
                            className="btn btn--change-poll"
                            onClick={this.fundApp}
                          >
                           3. Fund 1/2 Algo
                          </button>
                          <div
                            id="slider-b2"
                            className="btn btn--change-poll"
                            style={{ display: "none" }}
                          >
                            <div className="waiting-slider waiting-slider--full waiting-slider--helper-blue">
                              <div className="waiting-slider__track" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="dapp-field">
                        <label className="label dapp-field__label">
                          Opt App into Asset
                        </label>
                        <input
                          autoComplete="false"
                          className="input input--amount"
                          id="asa"
                          type="number"
                          placeholder="Opt-in"
                          readOnly={true}
                          disabled="true"
                        ></input>
                        <div className="dapp-field__btns">
                          <div
                            target="_blank"
                            className="btn btn--connect-wallet"
                            id="slider-b6"
                            style={{ display: "none" }}
                          >
                            <Svg24 />
                            <span id="b-32" className="count__title">
                              Opted-In
                            </span>
                          </div>
                          <button
                            id="b-5"
                            className="btn btn--change-poll"
                            onClick={this.addasset}
                          >
                            4. Opt-in to Burner
                          </button>
                          <div
                            id="slider-23"
                            className="btn btn--change-poll"
                            style={{ display: "none" }}
                          >
                            <div className="waiting-slider waiting-slider--full waiting-slider--helper-blue">
                              <div className="waiting-slider__track" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="dapp-field">
                        <label className="label dapp-field__label">
                         Send assets to app
                        </label>
                        <input
                          autoComplete="false"
                          className="input input--amount"
                          id="depAmt"
                          type="number"
                          placeholder="ASA amount"
                        />
                        <div className="dapp-field__btns">
                          <div
                            target="_blank"
                            className="btn btn--connect-wallet"
                            id="slider-42"
                            style={{ display: "none" }}
                          >
                            <Svg25 />
                            <span id="loaded" className="count__title">
                              Assets Sent
                            </span>
                          </div>
                          <button
                            id="b-444"
                            onClick={this.burn}
                            className="btn btn--change-poll"
                          >
                            5. Send Assets
                          </button>
                          <div
                            id="slider-43"
                            className="btn btn--change-poll"
                            style={{ display: "none" }}
                          >
                            <div className="waiting-slider waiting-slider--full waiting-slider--helper-blue">
                              <div className="waiting-slider__track" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <button
                className="btn btn--generate-link"
                id="deploy"
                onClick={this.delete}
              >
               6. Burn Baby Burn
              </button>
              <br />
              <span id="badge-verification-2" className="badge jsx-4236559370">
                <div id="slider-32" style={{ display: "none" }}>
                  <div className="waiting-slider--full waiting-slider--helper-blue waiting-slider-3">
                    <div className="waiting-slider__track" />
                  </div>
                </div>
                <div id="verify-label-22">Contract Verification</div>
              </span>
              <span
                id="badge-verified-2"
                className="badge badge-2"
                style={{ display: "none" }}
              >
                <div id="verified-label">
                  <Svg26 />
                  <div className="app-verify">🔥 Assets Burned</div>
                </div>
              </span>
              <div className="dapp-field burner-log">
              <label className="label dapp-field__label-4 modal-topbar">
                  <Svg27 />
                  <label className="dapp-code">Burner LOG</label>
                </label>
              
                <div
                  className="input input--amount-4 modal-body"
                  autoCorrect="off"
                  spellCheck="false"
                  id="myLog"
                  disabled
                >
                <div
                  className="input modal-body"
                  autoCorrect="off"
                  spellCheck="false"
                  id="myLog22"
                  disabled
                >
                  </div>
                </div>
              </div>
              <div id="wrapper">
              <div id="burn-wrapper" style={{display: "none"}}>
                <div id="msg" className="msg msg--success">
                  <div className="copyable">
                    <CopyPasteText
                    text="Copy me!"
                    copyText={"Asset transfer txn: " + this.state.burnProof2 + " Burn txn: " + this.state.burnProof}
                    hideIcon={true}
                  />
                    <span className="copy" />
                  </div>
                  <button
                    id="msg-close"
                    className="msg__close"
                    onClick={() => {
                      document.getElementById("msg").style.display = "none";
                    }}
                  >
                    <Svg6 />
                  </button>
                </div>

              </div>
            </div>
              <div className="no-display">
              <div className="ballot" />
              <div id="modal-root" style={{ display: "none" }}>
                <div className="modal">
                  <div className="modal-content modal-content-size">
                    <div className="modal-topbar">
                      <h2 id="poll-title" className="modal-title">
                        Voting Data
                      </h2>
                      <button id="div-close" className="modal-close">
                        <Svg28 />
                      </button>
                    </div>
                    <div className="modal-body">
                      <div className="dapp-field" />
                      <div className="dapp-field">
                        <div className="dapp-container">
                          <div className="tallies-field">
                            <label
                              className="tallies-label"
                              id="textTallies-1"
                            />
                            <p
                              className="input input--amount"
                              id="textTallies-2"
                            />
                          </div>
                          <button id="plotly-switch" className="dapp-switch">
                            <Svg29 />
                          </button>
                          <div className="tallies-field">
                            <label
                              className="tallies-label"
                              id="textTallies-3"
                            />
                            <p
                              className="input input--amount"
                              id="textTallies-4"
                            />
                          </div>
                        </div>
                        <div id="plotly-container" style={{ display: "none" }}>
                          <div id="dappChart"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <button
                className="btn btn--generate-link"
                id="options-btn-2"
                data-bs-toggle="modal"
                data-bs-target="#exampleModal"
              >
                <span className="options__title">Contract IDs</span>
                <Svg30 />
              </button>
            
              <div
                id="options-div-2"
                className="options-div"
                style={{ display: "block" }}
              >

              </div>
              <div
                id="modal-root-8"
                className="modal-root-3 modal fade"
                style={{ display: "none" }}
              >

                <div className="modal-topbar">
                  <h2 id="dappTitle-3" className="modal-title">
                    Verify Primitives
                  </h2>
                  <button id="options-close-2" className="modal-close">
                    <Svg31 />
                  </button>
                </div>
                <div className="dapp-field">
                  <label className="label dapp-field__label-2">
                    Voting token
                  </label>
                  <input
                    type="number"
                    placeholder="asset id"
                    className="input input--amount-3"
                    autoCorrect="off"
                    spellCheck="false"
                    id="assetTwo"
                    defaultValue
                  />
                </div>
                <div className="dapp-field">
                  <label className="label dapp-field__label-2">App ID</label>
                  <input
                    type="number"
                    placeholder="App ID"
                    className="input input--amount-3"
                    autoCorrect="off"
                    spellCheck="false"
                    id="appIdTwo"
                    defaultValue
                  />
                </div>
              </div>
              <div className="footer-top-1">
                <button
                  id="info-3"
                  className="shoulder__item"
                  data-bs-toggle="root-modal-11"
                  data-bs-target="#exampleModal"
                  onClick={() => {
                    document.getElementById("modal-root-11").style.display =
                      "block";
                  }}
                >
                  <Svg32 />
                </button>
                <div
                  id="modal-root-11"
                  style={{ display: "none" }}
                  className="modal fade"
                >
                  <ul>
                    <div className="modal">
                      <div className="modal-content modal-content-size">
                        <div className="modal-topbar">
                          <h2 className="modal-title">Deleting apps</h2>
                          <button
                            id="info-close-3"
                            className="modal-close"
                            onClick={() => {
                              document.getElementById(
                                "modal-root-11"
                              ).style.display = "none";
                            }}
                          >
                            <Svg33 />
                          </button>
                        </div>
                        <div className="modal-body">
                          <p>
                            Every Algorand address can have a maximum of 10
                            deployed apps (polls, contracts, etc) at any given
                            time. When the maximum number of apps has been
                            reached, that Algorand address will no longer be
                            able to deploy apps.
                          </p>
                          <p>

                            It is recommended that all unused/unneeded apps be
                            deleted. If the maximum number of apps has been
                            reached and cannot be deleted, then a new Algorand
                            address will need to be created.
                          </p>
                        </div>
                      </div>
                    </div>
                  </ul>
                </div>
                <span id="delete-verification" className="badge jsx-4236559370">
                  <div id="slider-5" style={{ display: "none" }}>
                    <div className="waiting-slider--full waiting-slider--helper-blue waiting-slider-3">
                      <div className="waiting-slider__track" />
                    </div>
                  </div>
                  <div id="verify-label-4">Indexer Keys</div>
                </span>
                <span
                  id="deleted-verified"
                  className="badge badge-2"
                  style={{ display: "none" }}
                >
                  <div id="verified-label">
                    <Svg34 />
                    <div className="app-verify">App deleted</div>
                  </div>
                </span>
              </div>
              <div id="dappdiv" className="algo-dapp-widget" align="center">
                <div className="footer-btns" align="center">
                  <button
                    onClick={this.startRefresh}
                    id="check"
                    className="btn btn--connect-wallet"
                  >
                    <Svg35 />
                    <span className="count__title-3">Refresh</span>
                  </button>
                  <button id="delete" className="btn btn--connect-wallet">
                    <Svg36 />
                    <span className="count__title-3">Delete Poll</span>
                  </button>
                </div>
                <div id="dappChart" />
              </div>
              </div>
            </div>
            <div className="footer">
              <div className="footer-max-width-margin">
                <footer className="footer-max-width">
                  <div className="f5 footer-columns grid">
                    <div className="footer-columns">
                      <h4 className="footer-columns fw5">General resources</h4>
                      <p className="footer-columns">
                        <a
                          href="https://www.pipeline-ui.com/docs/teal%20contracts%20lab/about/"
                          className="footer-columns"
                        >
                          Docs
                        </a>
                      </p>
                      <p className="footer-columns">

                        <a
                          className="footer-columns"
                          href="https://www.pipeline-ui.com/docs/pipeline"
                        >
                          Learn
                        </a>
                      </p>
                      <p className="footer-columns">
                        <a
                          className="footer-columns"
                          href="https://headline.dev"
                        >
                          Portfolio
                        </a>
                      </p>
                      <p className="footer-columns">
                        <a
                          className="footer-columns"
                          href="https://www.pipeline-ui.com/blog"
                        >
                          Blog
                        </a>
                      </p>
                      <p className="footer-columns">
                        <a
                          className="footer-columns"
                          href="https://lunarcrush.com/influencers/headline_crypto"
                        >
                          Analytics
                        </a>
                      </p>
                      <p className="footer-columns">
                        <a
                          className="footer-columns"
                          href="https://www.reddit.com/r/HEADLINECrypto"
                        >
                          Reddit
                        </a>
                      </p>
                      <p className="footer-columns">
                        <a
                          className="footer-columns"
                          href="https://t.me/headliners"
                        >
                          Telegram
                        </a>
                      </p>
                    </div>
                    <div className="footer-columns">
                      <h4 className="footer-columns fw5">More</h4>
                      <p className="footer-columns">
                        <a className="footer-columns" href="https://forum.ax">
                          FORUM
                        </a>
                      </p>
                      <p className="footer-columns">
                        <a
                          href="mailto:contact@headline-inc.com"
                          rel="noopener noreferrer"
                          target="_blank"
                          className="footer-columns"
                        >
                          Contact Sales
                        </a>
                      </p>
                      <p className="footer-columns">
                        <a
                          href="https://github.com/headline-design"
                          rel="noopener noreferrer"
                          target="_blank"
                          className="footer-columns"
                        >
                          GitHub
                        </a>
                      </p>
                      <p className="footer-columns">
                        <a
                          href="https://github.com/headline-design/algo-dapp"
                          rel="noopener noreferrer"
                          target="_blank"
                          className="footer-columns"
                        >
                          Releases
                        </a>
                      </p>
                      <p className="footer-columns">
                        <a
                          className="footer-columns"
                          href="https://www.headline-inc.com/roadmap/trajectory"
                        >
                          Roadmap
                        </a>
                      </p>
                    </div>
                    <div className="footer-columns">
                      <h4 className="footer-columns fw5">About HEADLINE INC</h4>
                      <p className="footer-columns">
                        <a
                          href="https://www.pipeline-ui.com"
                          rel="noopener noreferrer"
                          target="_blank"
                          className="footer-columns"
                        >
                          PIPELINE-UI
                        </a>
                      </p>
                      <p className="footer-columns">
                        <a
                          href="https://www.algopay.finance"
                          rel="noopener noreferrer"
                          target="_blank"
                          className="footer-columns"
                        >
                          AlgoPay
                        </a>
                      </p>
                      <p className="footer-columns">
                        <a
                          href="https://www.libra-network.com"
                          rel="noopener noreferrer"
                          target="_blank"
                          className="footer-columns"
                        >
                          Libra Network
                        </a>
                      </p>
                      <p className="footer-columns">
                        <a
                          href="https://algorand.foundation/news/headline-inc-development-award"
                          rel="noopener noreferrer"
                          target="_blank"
                          className="footer-columns"
                        >
                          Algorand Foundation
                        </a>
                      </p>
                      <p className="footer-columns">
                        <a
                          href="https://twitter.com/headline_crypto"
                          rel="noopener noreferrer"
                          target="_blank"
                          className="footer-columns"
                        >
                          Twitter
                        </a>
                      </p>
                    </div>
                    <div className="footer-columns">
                      <h4 className="footer-columns fw5">Legal</h4>
                      <p className="footer-columns">
                        <a
                          href="https://www.headline-inc.com/privacy"
                          rel="noopener noreferrer"
                          target="_blank"
                          className="footer-columns"
                        >
                          Privacy Policy
                        </a>
                      </p>
                      <p className="footer-columns">
                        <a
                          href="https://www.headline-inc.com/terms-of-use"
                          rel="noopener noreferrer"
                          target="_blank"
                          className="footer-columns"
                        >
                          Terms of use
                        </a>
                      </p>
                    </div>
                  </div>
                  <div className="copyright f6 footer-columns">
                    <a
                      href="https://headline-inc.com"
                      title="Go to the HEADLINE INC website"
                      rel="noopener noreferrer"
                      target="_blank"
                      aria-label="HEADLINE"
                      className="footer-columns"
                    >
                      <svg
                        className="Footer-module--logo--3otJM"
                        width={230}
                        height={60}
                        viewBox="15 0 450 100"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill="current-color"
                          d="M86.3897552,55.1804733v4.9573364c0,0.2512817-0.0761719,0.4746094-0.2264404,0.6639404   c-0.1516724,0.190918-0.4000244,0.2879639-0.7379761,0.2879639H58.6661263c-0.7120361,0-1.072998-0.3818359-1.072998-1.1351318   V16.6885891c0-0.7128897,0.2875977-1.074523,0.8548584-1.074523H84.988205c0.4946899,0,0.7454224,0.3204346,0.7454224,0.9522085   v4.7121582c0,0.7537842-0.3429565,1.1358643-1.0195312,1.1358643H66.6558685c-0.6031494,0-0.8963013,0.2688599-0.8963013,0.8222046   v10.7094135c0,0.5947876,0.239563,0.8840942,0.7325439,0.8840942h12.4768066c0.5672607,0,0.8548584,0.3201294,0.8548584,0.9519043   v4.9567871c0,0.25177-0.0584106,0.4445801-0.1734009,0.5732422c-0.1156616,0.1292725-0.3266602,0.1946411-0.6272583,0.1946411   H66.4367523c-0.4556885,0-0.6771851,0.229187-0.6771851,0.7006226v11.3821411c0,0.4717407,0.18573,0.7009277,0.5678101,0.7009277   h19.1531372C86.083847,54.2902756,86.3897552,54.589653,86.3897552,55.1804733z M257.6347046,15.6140661h-5.1432037   c-0.5674438,0-0.8551636,0.3408813-0.8551636,1.0133657v28.0271015c0,0.3097534-0.0751953,0.4950562-0.2241211,0.5501099   c-0.1483765,0.0577393-0.3477783-0.074707-0.5886841-0.383667l-17.5657959-28.3961811   c-0.2207031-0.328125-0.4272461-0.5477285-0.6144409-0.6530142c-0.1879883-0.1044922-0.4698486-0.1577148-0.8373413-0.1577148   h-5.4718018c-0.6033325,0-0.9093628,0.3616333-0.9093628,1.074523v43.3883057c0,0.671936,0.3427124,1.0128174,1.0186157,1.0128174   h4.815918c0.336853,0,0.5894775-0.0861816,0.7503052-0.2563477c0.1603394-0.1693726,0.2324219-0.4246216,0.2140503-0.7564697   V30.7028103c0-0.1893311,0.0548096-0.2988892,0.1669922-0.335083c0.1124878-0.03479,0.2355957,0.0632935,0.3720093,0.291687   l18.7157593,29.7421284c0.2244263,0.3363647,0.4360352,0.5307617,0.6471558,0.5945435   c0.2010498,0.0622559,0.4345093,0.0936279,0.6942749,0.0936279h4.5414581c0.3004761,0,0.5386963-0.0856323,0.7080688-0.2547607   c0.1702271-0.1690674,0.2563477-0.4036255,0.2563477-0.6971436V16.5048122   C258.3257446,15.9137487,258.0933838,15.6140661,257.6347046,15.6140661z M216.0464325,15.6140661h-6.5117798   c-0.5671387,0-0.8548584,0.3616333-0.8548584,1.074523v43.2659912c0,0.3741455,0.076355,0.6591797,0.2263184,0.8469238   c0.1507568,0.1911621,0.4541016,0.288208,0.9019165,0.288208h5.690918c0.4818115,0,0.8306274-0.1063843,1.0369873-0.315918   c0.2058105-0.210022,0.3103027-0.5681763,0.3103027-1.0643311V16.6274319   C216.8462372,15.9549475,216.5771332,15.6140661,216.0464325,15.6140661z M201.4916229,54.2902756H183.54216   c-0.3820801,0-0.5679321-0.229187-0.5679321-0.7009277V16.6274319c0-0.6724844-0.269104-1.0133657-0.7995605-1.0133657h-6.5117188   c-0.5674438,0-0.8551025,0.3616333-0.8551025,1.074523v43.2659912c0,0.3738403,0.0762939,0.6589355,0.2265015,0.8469238   c0.1507568,0.1911621,0.435791,0.288208,0.8466187,0.288208h25.555603c0.3371582,0,0.5852661-0.0968018,0.737854-0.2879639   c0.1502686-0.1890869,0.2263184-0.4124146,0.2263184-0.6639404v-4.9573364   C202.4007416,54.589653,202.0949554,54.2902756,201.4916229,54.2902756z M165.5148163,26.2516994   c1.4908447,3.2747803,2.2468262,7.2634296,2.2468262,11.8554707c0,4.7961426-0.8019409,8.960083-2.3834839,12.3762817   c-1.5823364,3.4180908-4.017395,6.0684814-7.2371216,7.878418c-3.2183838,1.8099976-7.3206177,2.7278442-12.1932373,2.7278442   h-10.560791c-0.7487793,0-1.1282959-0.4437866-1.1282959-1.319397V16.7499905c0-0.4155884,0.0862427-0.7120972,0.2562866-0.8809195   c0.1702881-0.1691284,0.4637451-0.2550049,0.8720093-0.2550049h8.6729126c0.9888916,0,1.7539673,0.020752,2.274353,0.0614624   c4.9403076,0.1217651,9.0422363,1.1013174,12.1896362,2.9112539   C161.6702728,20.3977566,164.0223236,22.9764309,165.5148163,26.2516994z M159.2115326,38.2297287   c0-3.8927002-0.5145264-7.0485859-1.5294189-9.3802509c-1.0130615-2.3262939-2.5908813-4.0397339-4.6901245-5.0928955   c-2.1016235-1.0532227-4.8027344-1.5871582-8.0288086-1.5871582h-2.0246582c-0.34552,0-0.5134277,0.269104-0.5134277,0.8226929   v30.842165c0,0.4716797,0.2214966,0.7008667,0.6772461,0.7008667h1.3684082c3.3360596,0,6.1293945-0.5341797,8.3024292-1.5876465   c2.1707764-1.0518799,3.8041382-2.7966919,4.8546753-5.1851807   C158.6786957,45.3710861,159.2115326,42.1638718,159.2115326,38.2297287z M127.9221649,59.5767746   c0.1110229,0.3318481,0.1110229,0.668457-0.0001221,1c-0.1140747,0.3403931-0.3274536,0.5129395-0.6342773,0.5129395h-6.6212158   c-0.5268555,0-0.8692017-0.276001-1.0175781-0.8205566l-3.173584-9.9122925   c-0.0361328-0.1991577-0.0980835-0.3483276-0.1848755-0.4474487c-0.0847168-0.0936279-0.2510376-0.1412354-0.4939575-0.1412354   h-14.2280884c-0.3143311,0-0.5184937,0.1723022-0.6244507,0.5264893l-3.2828979,10.0369873   c-0.0365601,0.2472534-0.142395,0.4403076-0.3132324,0.5679321c-0.1685791,0.1262817-0.4055786,0.1901245-0.7045898,0.1901245   h-5.3080444c-0.3060303,0-0.5280762-0.1507568-0.6600952-0.4483032c-0.1313477-0.2906494-0.1226807-0.6697998,0.0259399-1.1265869   l13.789917-42.7752075c0.1466675-0.4105225,0.3059082-0.7030029,0.4735718-0.8705435   c0.1704102-0.1691284,0.4638672-0.2550049,0.8721313-0.2550049h6.8401489c0.7783813,0,1.3048706,0.4198599,1.5647583,1.2478628   L127.9221649,59.5767746z M114.2857513,41.8490524l-5.2524414-16.3375874   c-0.1029053-0.2680054-0.2213745-0.4049683-0.3512573-0.4049683c-0.1286621,0-0.2466431,0.1568604-0.3504639,0.4666748   l-5.3080444,16.2774677c-0.121521,0.3624268-0.1286621,0.6213989-0.0213623,0.7705688   c0.0778809,0.1082153,0.2216187,0.163269,0.427124,0.163269h10.4512329c0.1832275,0,0.3151245-0.0513306,0.3917847-0.1523438   C114.3849335,42.4840012,114.3894501,42.2205124,114.2857513,41.8490524z M294.7910156,54.2902756h-19.1534424   c-0.3820801,0-0.567688-0.229187-0.567688-0.7009277V42.2072067c0-0.4714355,0.2214966-0.7006226,0.6772461-0.7006226h12.5863647   c0.3007202,0,0.5118408-0.0653687,0.6275024-0.1946411c0.1148682-0.1289673,0.1730957-0.3217163,0.1730957-0.5732422v-4.9567871   c0-0.6317749-0.2876587-0.9519043-0.8548584-0.9519043h-12.4768066c-0.492981,0-0.7325439-0.2893066-0.7325439-0.8840942   V23.2365017c0-0.5533447,0.2932739-0.8222046,0.8963623-0.8222046h18.0581665c0.6766968,0,1.0197144-0.3820801,1.0197144-1.1358643   v-4.7121582c0-0.6317739-0.2507324-0.9522085-0.7455444-0.9522085h-26.5402222   c-0.5671997,0-0.8548584,0.3616333-0.8548584,1.074523v43.2659912c0,0.7532959,0.361084,1.1351318,1.0731201,1.1351318h26.7590942   c0.3379517,0,0.5865479-0.0970459,0.7380981-0.288208c0.1502686-0.1893311,0.2263184-0.4127197,0.2263184-0.6636963v-4.9573364   C295.7001343,54.589653,295.3943481,54.2902756,294.7910156,54.2902756z M48.6530037,15.65026H42.181385   c-0.4630737,0-0.8397217,0.3767691-0.8397217,0.8399649V27.697134c0,0.7032471-0.5720215,1.2752075-1.2753296,1.2752075H26.7614021   c-0.7033081,0-1.2753906-0.5719604-1.2753906-1.2752075V16.4330349c0-0.4628897-0.3766479-0.8397207-0.8397217-0.8397207   h-6.4715576c-0.4630737,0-0.8398438,0.3768311-0.8398438,0.8397207v43.8361206c0,0.4629517,0.37677,0.8397217,0.8398438,0.8397217   h6.4715576c0.4630737,0,0.8397217-0.37677,0.8397217-0.8397217V38.7194748c0-0.7032471,0.5720825-1.2752075,1.2753906-1.2752075   h13.3049316c0.7033081,0,1.2753296,0.5719604,1.2753296,1.2752075v21.6065674c0,0.4629517,0.3766479,0.8397217,0.8397217,0.8397217   h6.4716187c0.4630127,0,0.8396606-0.37677,0.8396606-0.8397217V16.4902248   C49.4926643,16.027029,49.1160164,15.65026,48.6530037,15.65026z M320.3685913,15.6313696   c0.5036011,0,0.7549744,0.3273764,0.7549744,0.9796762v43.1023293c0,0.4900818-0.0993347,0.8370628-0.2962952,1.0409355   c-0.1986694,0.2048569-0.53125,0.3058128-0.9985657,0.3058128h-5.6114197c-0.4319153,0-0.720459-0.0921364-0.8629761-0.2754288   c-0.1442566-0.1832886-0.2159729-0.4596977-0.2159729-0.8262787V16.6723061c0-0.6934671,0.2695312-1.0409365,0.8094177-1.0409365   H320.3685913z M319.8286438,61.1848907h-5.6113281c-0.4785156,0-0.7929688-0.1054688-0.9619141-0.3232422   c-0.1601562-0.2050781-0.2421875-0.5087891-0.2421875-0.9033203V16.6721954c0-0.9638681,0.5078125-1.1660166,0.9345703-1.1660166   h6.4208984c0.4013672,0,0.8798828,0.1918945,0.8798828,1.1049814v43.1020508c0,0.5205078-0.1113281,0.8994141-0.3310547,1.1279297   C320.6929016,61.0725861,320.3364563,61.1848907,319.8286438,61.1848907z M313.9477844,15.7561789   c-0.2939453,0-0.6845703,0.0947266-0.6845703,0.9160166v43.2861328c0,0.3369141,0.0634766,0.5888672,0.1894531,0.7490234   c0.1171875,0.1513672,0.3740234,0.2275391,0.7646484,0.2275391h5.6113281c0.4306641,0,0.7363281-0.0898438,0.9091797-0.2675781   c0.1728516-0.1796875,0.2607422-0.5009766,0.2607422-0.9541016V16.6111603c0-0.7661142-0.359375-0.8549814-0.6298828-0.8549814   H313.9477844z M361.3762207,15.6313696c0.4319153,0,0.6478882,0.2862091,0.6478882,0.8571558v43.653183   c0,0.2862091-0.0812073,0.5106659-0.2427368,0.6733742c-0.1615601,0.1636887-0.3869934,0.2450409-0.6746521,0.2450409h-4.4780884   c-0.2522278,0-0.4776917-0.0303841-0.6746521-0.0921364c-0.1986694-0.0607681-0.4051208-0.2538643-0.6202393-0.5812378   l-18.453949-29.7549133c-0.1442566-0.2450409-0.2790222-0.346487-0.4051208-0.3063011   c-0.1261292,0.0411663-0.188324,0.1636887-0.188324,0.3675632v29.3878384   c0.0354309,0.6527901-0.2703857,0.979187-0.9173889,0.979187h-4.7484436c-0.6478882,0-0.9709473-0.3263969-0.9709473-0.979187   V16.6723061c0-0.6934671,0.2867737-1.0409365,0.8629456-1.0409365h5.3954773c0.3593445,0,0.6297302,0.0519495,0.8094177,0.1533966   c0.179657,0.1024275,0.3783569,0.3165941,0.5942993,0.642499l17.3197632,28.408165   c0.2513733,0.3273735,0.4586792,0.4596977,0.6210938,0.3979454c0.1615295-0.0607681,0.2427368-0.2548447,0.2427368-0.5812378   V16.6110458c0-0.6522999,0.2695007-0.9796762,0.8093872-0.9796762H361.3762207z M361.1069641,61.1848907h-4.4785156   c-0.2646484,0-0.5048828-0.0332031-0.7119141-0.0976562c-0.2294922-0.0693359-0.4541016-0.2763672-0.6875-0.6318359   l-18.4560547-29.7578125c-0.1230469-0.2084961-0.2167969-0.2739258-0.2597656-0.2529297   c-0.0244141,0.0078125-0.1015625,0.0327148-0.1015625,0.2485352v29.3881836   c0.0195312,0.3554688-0.0615234,0.6337891-0.2392578,0.8222656c-0.1767578,0.1865234-0.4472656,0.28125-0.8037109,0.28125 h-4.7480469c-0.7167969,0-1.0957031-0.3818359-1.0957031-1.1035156V16.6721954   c0-0.9638681,0.5371094-1.1660166,0.9873047-1.1660166h5.3955078c0.3789062,0,0.671875,0.0571289,0.8710938,0.1699219   c0.2001953,0.1137695,0.4091797,0.336915,0.6376953,0.6821299l17.3212891,28.4116211   c0.1933594,0.25,0.3652344,0.3886719,0.4707031,0.3466797c0.1337891-0.0507812,0.1621094-0.28125,0.1621094-0.4648438V16.6111603   c0-0.9130869,0.5078125-1.1049814,0.9335938-1.1049814h5.0722656c0.3525391,0,0.7724609,0.1704102,0.7724609,0.9824228V60.141922   c0,0.3193359-0.09375,0.5751953-0.2783203,0.7607422C361.6860657,61.0901642,361.4282532,61.1848907,361.1069641,61.1848907z    M336.5307922,30.1917267c0.15625,0,0.3095703,0.1259766,0.4560547,0.3764648l18.453125,29.753418   c0.1953125,0.296875,0.3808594,0.4755859,0.5498047,0.5273438c0.1845703,0.0566406,0.3984375,0.0859375,0.6386719,0.0859375   h4.4785156c0.2558594,0,0.4472656-0.0683594,0.5859375-0.2080078s0.2060547-0.3310547,0.2060547-0.5849609V16.4886017   c0-0.6567392-0.2978516-0.7324228-0.5224609-0.7324228h-5.0722656c-0.2929688,0-0.6835938,0.0888672-0.6835938,0.8549814   v28.0405273c0,0.3818359-0.1083984,0.6171875-0.3232422,0.6992188c-0.2294922,0.0849609-0.4736328-0.0605469-0.765625-0.4394531   l-17.3261719-28.4194336c-0.2011719-0.3032227-0.3867188-0.5058603-0.5498047-0.5981455   c-0.1611328-0.0913086-0.4130859-0.1376953-0.7480469-0.1376953h-5.3955078c-0.3164062,0-0.7373047,0.0947266-0.7373047,0.9160166   v43.4091797c0,0.5820312,0.2685547,0.8535156,0.8457031,0.8535156h4.7480469c0.2851562,0,0.4941406-0.0683594,0.6220703-0.203125   c0.1289062-0.1367188,0.1865234-0.3525391,0.1708984-0.6435547V30.6931915c0-0.3286133,0.1494141-0.4462891,0.2753906-0.4868164   C336.4682922,30.1966095,336.4995422,30.1917267,336.5307922,30.1917267z M392.4559021,16.0293179   c1.762207,0.6738644,3.3455811,1.6133537,4.7484436,2.8165073c1.4028625,1.2046242,2.5534668,2.6023426,3.4535828,4.1941319   c0.8983765,1.5917912,1.4918518,3.3061028,1.780365,5.1429348c0.1079712,0.5719261,0.1166077,0.9394894,0.0267639,1.1017056   c-0.0898438,0.1636887-0.2790222,0.2661152-0.5666504,0.306303l-6.1513367,0.4895935   c-0.2876587,0-0.4673157-0.0705719-0.539032-0.2141666c-0.0725403-0.1426144-0.1442566-0.356781-0.2159424-0.6429901   c-0.4319153-2.2852573-1.3139038-4.1524754-2.6441956-5.6016502c-1.3311462-1.4486866-3.0942078-2.1735191-5.2874756-2.1735191   c-3.0579529,0-5.4326172,1.3467484-7.1231384,4.0407352c-1.6904907,2.6939888-2.5353394,6.939579-2.5353394,12.7348137   c0,5.714859,0.8171997,9.9178123,2.4550171,12.6122894c1.6360779,2.6934967,4.091095,4.0402489,7.3649902,4.0402489   c2.2304077,0,4.1360168-0.6214256,5.7194214-1.867218c1.5825195-1.244812,2.8774109-3.3364868,3.885498-6.2760048   c0.1079712-0.3254166,0.4310303-0.4283333,0.9709167-0.3058128l4.5860596,1.1017075   c0.1434021,0.0411644,0.2781677,0.1440849,0.4051514,0.3067894c0.1252441,0.1636887,0.1528931,0.5106697,0.0812073,1.0409393   c-0.2159729,0.9389992-0.5943298,1.9799347-1.1333618,3.12183c-0.5398865,1.1438522-1.2413025,2.2867279-2.1042786,3.4286194   c-0.8638306,1.143856-1.9159546,2.1847916-3.1564331,3.1228104c-1.2413025,0.939003-2.653656,1.6937294-4.2362061,2.2651672   c-1.5834045,0.5714378-3.363739,0.8576431-5.3419189,0.8576431c-3.6686707,0-6.8440857-0.9801636-9.5236816-2.939518   c-2.6795959-1.9583702-4.7398376-4.7038193-6.1781006-8.2343788c-1.4391479-3.5295792-2.1578369-7.662941-2.1578369-12.3976326   c0-4.7753716,0.718689-8.8778591,2.1578369-12.3064804c1.4382629-3.428133,3.4889832-6.0809536,6.1513062-7.958952   c2.6614685-1.877018,5.8273926-2.8165083,9.4969177-2.8165083   C388.8217773,15.0192556,390.6928101,15.3559427,392.4559021,16.0293179z M386.8979797,61.798172   c-3.6787109,0-6.9082031-0.9970703-9.5976562-2.9648438c-2.6865234-1.9628906-4.7802734-4.7519531-6.2207031-8.2880859   c-1.4375-3.5263672-2.1660156-7.7138672-2.1660156-12.4438477c0-4.7709961,0.7294922-8.9277344,2.1669922-12.3549805   c1.4404297-3.4335938,3.5244141-6.1293945,6.1943359-8.0126953c2.671875-1.8842783,5.8916016-2.8393564,9.5693359-2.8393564   c1.984375,0,3.8876953,0.3422852,5.65625,1.0180664l0,0c1.765625,0.6748056,3.3759766,1.6298838,4.7851562,2.8388681   c1.40625,1.2075195,2.5771484,2.6298828,3.4804688,4.2270508c0.9023438,1.5981445,1.5068359,3.3427734,1.7949219,5.1850586   c0.1162109,0.6118164,0.1210938,0.9882812,0.0136719,1.1816406c-0.109375,0.1992188-0.3310547,0.3237305-0.6591797,0.3701172   l-6.1591797,0.4897461c-0.0009766,0-0.0009766,0-0.0019531,0c-0.3466797,0-0.5644531-0.0952148-0.6582031-0.2827148   c-0.0751953-0.1474609-0.1494141-0.3662109-0.2255859-0.6679688c-0.4267578-2.2583008-1.3056641-4.1225586-2.6142578-5.5478516   c-1.3007812-1.4155273-3.0488281-2.1333008-5.1962891-2.1333008c-2.9980469,0-5.359375,1.3398438-7.0175781,3.9824219   c-1.6689453,2.6606445-2.515625,6.9228516-2.515625,12.668457c0,5.6660156,0.8203125,9.8867188,2.4365234,12.5478516   c1.6044922,2.640625,4.0458984,3.9794922,7.2587891,3.9794922c2.1923828,0,4.0898438-0.6191406,5.6416016-1.8408203   c1.5556641-1.2236328,2.8496094-3.3154297,3.8447266-6.21875c0.0898438-0.2714844,0.3574219-0.5595703,1.1162109-0.3867188   l4.5888672,1.1025391c0.171875,0.0488281,0.3291016,0.1660156,0.4736328,0.3505859   c0.1494141,0.1943359,0.1835938,0.5654297,0.1074219,1.1347656c-0.2197266,0.9560547-0.6044922,2.0146484-1.1445312,3.1591797   c-0.5429688,1.1484375-1.2548828,2.3095703-2.1181641,3.4501953c-0.8652344,1.1464844-1.9355469,2.2050781-3.1806641,3.1474609   c-1.2451172,0.9414062-2.6816406,1.7099609-4.2695312,2.2822266   C390.6899719,61.5071564,388.8784485,61.798172,386.8979797,61.798172z M386.8442688,15.1443624   c-3.625,0-6.7958984,0.9399424-9.4248047,2.793458c-2.6308594,1.855957-4.6865234,4.515625-6.1083984,7.9052734   c-1.4248047,3.3964844-2.1474609,7.5209961-2.1474609,12.2583008c0,4.6977539,0.7226562,8.8530273,2.1484375,12.3500977   c1.421875,3.4921875,3.4873047,6.2441406,6.1367188,8.1806641c2.6455078,1.9345703,5.8242188,2.9160156,9.4492188,2.9160156   c1.9521484,0,3.734375-0.2861328,5.2998047-0.8505859c1.5634766-0.5644531,2.9775391-1.3203125,4.203125-2.2470703   c1.2265625-0.9287109,2.2802734-1.9707031,3.1318359-3.0986328c0.8525391-1.1269531,1.5556641-2.2734375,2.0908203-3.4072266   c0.5332031-1.1279297,0.9111328-2.1699219,1.125-3.0966797c0.0810547-0.6025391,0.0126953-0.8427734-0.0595703-0.9365234   c-0.1103516-0.140625-0.2246094-0.2294922-0.3388672-0.2626953l-4.5820312-1.1005859   c-0.6943359-0.15625-0.7910156,0.1298828-0.8232422,0.2236328c-1.0107422,2.9501953-2.3320312,5.0810547-3.9267578,6.3359375   c-1.5966797,1.2558594-3.546875,1.8935547-5.7958984,1.8935547c-3.3056641,0-5.8193359-1.3798828-7.4716797-4.1005859   c-1.6416016-2.6992188-2.4736328-6.9648438-2.4736328-12.6767578c0-5.793457,0.859375-10.1000977,2.5546875-12.8012695   c1.7060547-2.7202148,4.1386719-4.0996094,7.2285156-4.0996094c2.2197266,0,4.0302734,0.7451172,5.3798828,2.2143555   c1.3408203,1.4599609,2.2402344,3.3652344,2.6748047,5.6625977c0.0693359,0.2758789,0.1376953,0.4780273,0.2050781,0.609375   c0.0595703,0.1210938,0.2646484,0.1459961,0.4267578,0.1459961l6.1416016-0.4887695   c0.2382812-0.0336914,0.3984375-0.1157227,0.4677734-0.2421875c0.0419922-0.0771484,0.09375-0.3105469-0.0410156-1.0180664   c-0.2851562-1.8168945-0.8789062-3.5332031-1.765625-5.1049805c-0.8896484-1.5717773-2.0419922-2.9716797-3.4257812-4.1606445   c-1.3876953-1.1894531-2.9736328-2.1298828-4.7128906-2.7949219l0,0   C390.6714172,15.4812765,388.7983704,15.1443624,386.8442688,15.1443624z"
                        />
                      </svg>
                    </a>
                    <div className="footer-columns">
                      Copyright © 2022 HEADLINE INC. All rights reserved.
                    </div>
                  </div>
                </footer>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
export default App;
