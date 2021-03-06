(function() {
  QUnit.module("Sites");

  QUnit.test("test sites and site classes", function (assert) {
      bkg.settings.updateSetting('whitelist', '');

      var domain = "test.com";
      var newSite = new Site(domain)

      assert.ok(newSite.domain === domain, 'site has correct name');
      assert.ok(newSite.isWhiteListed() === undefined, 'site is not whitelisted by default');
      
      newSite.setWhitelisted('whitelisted', true);
      assert.ok(newSite.isWhiteListed() === true, 'whitelisting a site works');

      newSite.addTracker({url: 'doubleclick.net'});
      var trackerList = newSite.trackerUrls;
      assert.ok(trackerList.length === 1, "add a tracker and get list");
      assert.ok(trackerList.indexOf('doubleclick.net') !== -1, "tracker list has correct domain");
  });

  QUnit.test("test site domains", function (assert) {
      // url -> expected processed site domain
      let tests = [
          ['http://192.168.1.0/', '192.168.1.0'],
          ['http://www.independent.co.uk/us', 'independent.co.uk']
      ];

      tests.map((test) => {
          let site = new Site(utils.extractHostFromURL(test[0]));
          assert.ok(site.domain === test[1], "site should have the correct domain");
      });
  });

  QUnit.test("test site score", function (assert) {

      let tests = [
          { values: {hasHTTPS:false, inMajorTrackingNetwork:false, totalBlocked: 0, hasObscureTracker: false}, result: {before: 'C', after: 'C'}},
          { values: {hasHTTPS:true, inMajorTrackingNetwork:false, totalBlocked: 0, hasObscureTracker: false}, result: {before: 'B', after: 'B'}},
          { values: {hasHTTPS:true, inMajorTrackingNetwork:true, totalBlocked: 1, hasObscureTracker: false}, result: {before: 'D', after: 'B'}},
          { values: {hasHTTPS:true, inMajorTrackingNetwork:true, totalBlocked: 11, hasObscureTracker: false}, result: {before: 'D', after: 'B'}},
          { values: {hasHTTPS:false, inMajorTrackingNetwork:false, totalBlocked: 9, hasObscureTracker: false}, result: {before: 'D', after: 'C'}},
          { values: {hasHTTPS:false, inMajorTrackingNetwork:true, totalBlocked: 10, hasObscureTracker: false}, result: {before: 'D', after: 'C'}},
          { values: {hasHTTPS:false, inMajorTrackingNetwork:false, totalBlocked: 20, hasObscureTracker: false}, result: {before: 'D', after: 'C'}},
          { values: {hasHTTPS:false, inMajorTrackingNetwork:false, totalBlocked: 20, hasObscureTracker: true}, result: {before: 'D', after: 'C'}},
          { values: {hasHTTPS:false, inMajorTrackingNetwork:false, totalBlocked: 1, hasObscureTracker: true}, result: {before: 'D', after: 'C'}},
          { values: {hasHTTPS:true, inMajorTrackingNetwork:true, totalBlocked: 1, hasObscureTracker: false}, result: {before: 'D', after: 'B'}},

          // basic tosdr test
          { values: {hasHTTPS:false, inMajorTrackingNetwork:false, totalBlocked: 0, hasObscureTracker: false, tosdr: {score: 100}}, result: {before: 'D', after: 'D'}},
          { values: {hasHTTPS:true, inMajorTrackingNetwork:false, totalBlocked: 0, hasObscureTracker: false, tosdr: {class: 'A'}}, result: {before: 'A', after: 'A'}},
          { values: {hasHTTPS:false, inMajorTrackingNetwork:false, totalBlocked: 0, hasObscureTracker: false, tosdr: {score: 0}}, result: {before: 'C', after: 'C'}},
          
          // don't user tosdr.score to upgrade to "A"
          { values: {hasHTTPS:false, inMajorTrackingNetwork:false, totalBlocked: 0, hasObscureTracker: false, tosdr: {score: -200}}, result: {before: 'B', after: 'B'}},
          { values: {hasHTTPS:false, inMajorTrackingNetwork:false, totalBlocked: 10, hasObscureTracker: false, tosdr: {score: -200}}, result: {before: 'C', after: 'B'}},
          { values: {hasHTTPS:false, inMajorTrackingNetwork:false, totalBlocked: 20, hasObscureTracker: false, tosdr: {score: -200}}, result: {before: 'D', after: 'B'}},
          { values: {hasHTTPS:true, inMajorTrackingNetwork:false, totalBlocked: 0, hasObscureTracker: false, tosdr: {score: -200}}, result: {before: 'B', after: 'B'}},
          { values: {hasHTTPS:true, inMajorTrackingNetwork:false, totalBlocked: 10, hasObscureTracker: false, tosdr: {score: -200}}, result: {before: 'B', after: 'B'}},
          { values: {hasHTTPS:true, inMajorTrackingNetwork:false, totalBlocked: 20, hasObscureTracker: false, tosdr: {score: -200}}, result: {before: 'C', after: 'B'}},

          // upgrade to "A" if tosdr.class is "A". Some of these might not be realistic.
          { values: {hasHTTPS:true, inMajorTrackingNetwork:false, totalBlocked: 10, hasObscureTracker: false, tosdr: {score: -200, class: 'A'}}, result: {before: 'B', after: 'A'}},
          { values: {hasHTTPS:true, inMajorTrackingNetwork:false, totalBlocked: 11, hasObscureTracker: false, tosdr: {score: -200, class: 'A'}}, result: {before: 'C', after: 'A'}},
          { values: {hasHTTPS:true, inMajorTrackingNetwork:false, totalBlocked: 25, hasObscureTracker: false, tosdr: {score: -200, class: 'A'}}, result: {before: 'D', after: 'A'}},

          // positive tosdr scores
          { values: {hasHTTPS:false, inMajorTrackingNetwork:false, totalBlocked: 0, hasObscureTracker: false, tosdr: {score: 200}}, result: {before: 'D', after: 'D'}},
          { values: {hasHTTPS:false, inMajorTrackingNetwork:false, totalBlocked: 10, hasObscureTracker: false, tosdr: {score: 100}}, result: {before: 'D', after: 'D'}},
          { values: {hasHTTPS:false, inMajorTrackingNetwork:false, totalBlocked: 20, hasObscureTracker: false, tosdr: {score: 200}}, result: {before: 'D', after: 'D'}},
          { values: {hasHTTPS:true, inMajorTrackingNetwork:false, totalBlocked: 0, hasObscureTracker: false, tosdr: {score: 100}}, result: {before: 'C', after: 'C'}},
          { values: {hasHTTPS:true, inMajorTrackingNetwork:false, totalBlocked: 10, hasObscureTracker: false, tosdr: {score: 200}}, result: {before: 'D', after: 'C'}},
          { values: {hasHTTPS:true, inMajorTrackingNetwork:false, totalBlocked: 20, hasObscureTracker: false, tosdr: {score: 100}}, result: {before: 'D', after: 'C'}},
          
          // tosdr classes
          { values: {hasHTTPS:false, inMajorTrackingNetwork:false, totalBlocked: 0, hasObscureTracker: false, tosdr: {class: 'A'}}, result: {before: 'B', after: 'B'}},
          { values: {hasHTTPS:false, inMajorTrackingNetwork:false, totalBlocked: 10, hasObscureTracker: false, tosdr: {class: 'B'}}, result: {before: 'D', after: 'C'}},
          { values: {hasHTTPS:false, inMajorTrackingNetwork:false, totalBlocked: 10, hasObscureTracker: false, tosdr: {class: 'D'}}, result: {before: 'D', after: 'D'}},
          { values: {hasHTTPS:false, inMajorTrackingNetwork:false, totalBlocked: 20, hasObscureTracker: false, tosdr: {class: 'C'}}, result: {before: 'D', after: 'C'}},
          { values: {hasHTTPS:true, inMajorTrackingNetwork:false, totalBlocked: 0, hasObscureTracker: false, tosdr: {class: 'A'}}, result: {before: 'A', after: 'A'}},
          { values: {hasHTTPS:true, inMajorTrackingNetwork:false, totalBlocked: 10, hasObscureTracker: false, tosdr: {class: 'A'}}, result: {before: 'B', after: 'A'}},
          { values: {hasHTTPS:true, inMajorTrackingNetwork:false, totalBlocked: 20, hasObscureTracker: false, tosdr: {class: 'C'}}, result: {before: 'D', after: 'B'}},
          { values: {hasHTTPS:true, inMajorTrackingNetwork:false, totalBlocked: 20, hasObscureTracker: false, tosdr: {class: 'D'}}, result: {before: 'D', after: 'C'}},
          
          // major networks
          { values: {hasHTTPS:true, isaMajorTrackingNetwork: true, inMajorTrackingNetwork:true, totalBlocked: 1, hasObscureTracker: false, tosdr: {score: 200}}, result: {before: 'D', after: 'D'}},
          { values: {hasHTTPS:true, isaMajorTrackingNetwork: true, inMajorTrackingNetwork:false, totalBlocked: 0, hasObscureTracker: false, tosdr: {score: 200}}, result: {before: 'D', after: 'D'}},
          { values: {hasHTTPS:true, isaMajorTrackingNetwork: true, inMajorTrackingNetwork:true, totalBlocked: 1, hasObscureTracker: false, tosdr: {class: 'C'}}, result: {before: 'D', after: 'C'}},
          { values: {hasHTTPS:true, isaMajorTrackingNetwork: true, inMajorTrackingNetwork:false, totalBlocked: 0, hasObscureTracker: false, tosdr: {class: 'D'}}, result: {before: 'D', after: 'D'}},

      ]

      tests.map(test => {
          let site = new Site('test.com');

          for(var value in test.values) {
              site.score[value] = test.values[value];
          }

          assert.ok(site.score.get().after === test.result.after, `site should have the correct after site score: got: ${site.score.get().after}, expected: ${test.result.after}`);
          assert.ok(site.score.get().before === test.result.before, `site should have the correct before site score: got: ${site.score.get().before}, expected: ${test.result.before}`);
      });
  });

  QUnit.test('test tosdr site scores', function(assert) {
      for (var tosdrUrl in tosdr) {
          let site = new Site(tosdrUrl)
          if (tosdr[tosdrUrl].hasOwnProperty('score')) {
              assert.ok(site.score.tosdr.score === tosdr[tosdrUrl].score, 'site object has correct tosdr score')
          }
      }

      // this should not have a tosdr entry
      let site = new Site('instagram.x.com')
      assert.ok(Object.keys(site.score.tosdr).length === 0, 'site should not have tosdr data')

  });

})();
