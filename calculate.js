window.addEventListener("load", (event) => {

  var calculateProfile = function(target, dmg, crit) {
    return [1, 2, 3, 4, 5, 6].map((x) => {
      if (x == 6) {
        return crit;
      } else if (x >= target) {
        return dmg;
      } else {
        return 0;
      }
    });
  }

  var calculatePermutations = function(attacks, profile) {
    if (attacks == 0) {
      return [];
    }
    if (attacks == 1) {
      return profile.map((a) => [a]);
    }
    return profile.flatMap((a) => {
      return calculatePermutations(attacks - 1, profile).map((sub) => [a].concat(sub));
    });
  }

  var groupResults = function(permutations) {
    var grouped = {};
    permutations.forEach((result) => {
      var sum = result.reduce((a, b) => a + b, 0);

      if (grouped[sum]) {
        grouped[sum] += 1;
      } else {
        grouped[sum] = 1;
      }
    });

    return grouped;
  }

  var groupResultsAsPercentage = function(permutations) {
    var count = permutations.length;
    var grouped = groupResults(permutations);
    var transformed = {};
    Object.keys(grouped).forEach((outer) => {
      transformed[outer] = 0.0;
      Object.keys(grouped).forEach((inner) => {
        if (parseInt(inner) >= parseInt(outer)) {
          transformed[outer] += ((grouped[inner] / count) * 100);
        }
      });
    });

    return Object.fromEntries(
      Object.entries(transformed).map(([key, value]) => [key, value.toFixed()])
    );

    return transformed;
  }

  var htmlHeader = "<thead><tr><th>Min. Damage</th><th>Probability</th></tr></thead>";
  var outputContainer = document.getElementById("output");
  var form = document.querySelector("form");
  var updateOutput = function() {
    var attack = parseInt(document.getElementById("attack").value);
    var damage = parseInt(document.getElementById("damage").value);
    var critical = parseInt(document.getElementById("critical").value);
    var target = parseInt(Array.prototype.slice.call(document.querySelectorAll("input[name=target]")).find((x) => x.checked).value);

    var data = groupResultsAsPercentage(calculatePermutations(attack, calculateProfile(target, damage, critical)));

    var htmlRows = Object.entries(data).map(([damage, probability]) => {
      if (probability == 0) {
        probability = "&lt; 1";
      }
      return "<tr><th>"+damage+"</th><td>"+probability+"%</td></tr>";
    }).join("\n");

    console.log({attack: attack, damage: damage, critical: critical, target: target});
    outputContainer.innerHTML = "<table>" + htmlHeader + "<tbody>" + htmlRows + "</tbody></table>";
  }

  window.addEventListener("change", (event) => {
    document.getElementById("attack").addEventListener("focus", (event) => {
      event.target.select();
    });
    document.getElementById("damage").addEventListener("focus", (event) => {
      event.target.select();
    });
    document.getElementById("critical").addEventListener("focus", (event) => {
      event.target.select();
    });


    updateOutput();
  });

  updateOutput();
});
