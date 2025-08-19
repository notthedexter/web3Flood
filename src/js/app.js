App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // Initialize web3 and set the provider to the testRPC.
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
    } else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('FloodFund.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with truffle-contract.
      var FloodFundArtifact = data;
      App.contracts.FloodFund = TruffleContract(FloodFundArtifact);

      // Set the provider for our contract.
      App.contracts.FloodFund.setProvider(App.web3Provider);

      // Use our contract to retrieve and mark the adopted pets.
      return App.bindEvents();
    });
  },

  bindEvents: function() {
    $(document).on('submit', '#donorRegistrationForm', App.registerDonor);
    $(document).on('submit', '#donationForm', App.donate);
    $(document).on('submit', '#checkDonorForm', App.checkDonorInfo);
    $(document).on('click', '#totalFundsButton', App.getTotalFunds);
  },

  registerDonor: function(event) {
    event.preventDefault();

    var donorName = $('#donorName').val();
    var donorMobile = $('#donorMobile').val();

    var floodFundInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.FloodFund.deployed().then(function(instance) {
        floodFundInstance = instance;

        // Execute the registration
        return floodFundInstance.registerDonor(donorName, donorMobile, { from: account });
      }).then(function(result) {
        console.log('Donor Registered', result);
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  donate: function(event) {
    event.preventDefault();

    var donationAmount = $('#donationAmount').val();
    var donationArea = $('#donationArea').val();
    var donorMobile = $('#donorMobileDonation').val();

    var floodFundInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.FloodFund.deployed().then(function(instance) {
        floodFundInstance = instance;

        // Execute the donation
        return floodFundInstance.donate(donationArea, donorMobile, { from: account, value: web3.utils.toWei(donationAmount, "ether") });
      }).then(function(result) {
        console.log('Donation Successful', result);
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  checkDonorInfo: function(event) {
    event.preventDefault();

    var donorAddress = $('#donorAddress').val();

    var floodFundInstance;

    App.contracts.FloodFund.deployed().then(function(instance) {
      floodFundInstance = instance;

      // Execute the call to get donor info
      return floodFundInstance.getDonorInfoByAddress(donorAddress);
    }).then(function(result) {
      $('#donorInfo').html(`Name: ${result[0]}<br>Mobile Number: ${result[1]}`);
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  getTotalFunds: function() {
    var floodFundInstance;

    App.contracts.FloodFund.deployed().then(function(instance) {
      floodFundInstance = instance;

      // Execute the call to get total funds
      return floodFundInstance.showTotal();
    }).then(function(result) {
      $('#fundsDisplay').html(`
        Sylhet: ${web3.utils.fromWei(result[1], "ether")} ETH<br>
        Chittagong South: ${web3.utils.fromWei(result[3], "ether")} ETH<br>
        Chittagong North: ${web3.utils.fromWei(result[5], "ether")} ETH<br>
        Total: ${web3.utils.fromWei(result[7], "ether")} ETH
      `);
    }).catch(function(err) {
      console.log(err.message);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
