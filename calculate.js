window.addEventListener("load", (event) => {

  var Miss = 0, Hit = 1, Crit = 2;
  calculateScenarios = (numberOfDice) => {
    if (numberOfDice == 1) {
      return [Miss, Hit, Crit].map((a) => [a]);
    }

    return [Miss, Hit, Crit].flatMap((a) => {
      return calculateScenarios(numberOfDice - 1).map((sub) => [a].concat(sub));
    });
  }

  reduceScenarios = (scenarios) => {
    var combinations = {};
    scenarios.forEach((x) => {
      var normalized = x.sort();
      if (combinations[normalized]) {
        combinations[normalized] += 1;
      } else {
        combinations[normalized] = 1;
      }
    });
    return combinations;
  }

  probabilityOfHit = (targetNumber) => {
    if (targetNumber == 3) {
      return 3 / 6;
    } else if (targetNumber == 4) {
      return 2 / 6;
    } else {
      return 1 / 6;
    }
  }

  probabilityOfMiss = (targetNumber) => {
    if (targetNumber == 3) {
      return 2 / 6;
    } else if (targetNumber == 4) {
      return 3 / 6;
    } else {
      return 4 / 6;
    }
  }

  probabilityProfile = (targetNumber) => {
    var profile = {};
    profile[Miss] = probabilityOfMiss(targetNumber);
    profile[Hit] = probabilityOfHit(targetNumber);
    profile[Crit] = 1 / 6;
    return profile;
  }

  damageProfile = (dmg, critDam) => {
    var profile = {};
    profile[Miss] = 0;
    profile[Hit] = dmg;
    profile[Crit] = critDam;
    return profile;
  }

  reduceCombinations = (scenarios, probabilities, damageValues) => {
    var reduced = {};
    Object.keys(scenarios).forEach((key) => {
      var combination = key.split(",").map((x) => parseInt(x));
      var combinedProbability = combination.reduce((acc, action) => acc * probabilities[action], 1) * scenarios[key];
      var combinedValue = combination.reduce((acc, action) => acc + damageValues[action], 0);
      if (!reduced[combinedValue]) {
        reduced[combinedValue] = 0;
      }
      reduced[combinedValue] += combinedProbability;
    });
    return reduced;
  }

  accumulateResults = (results) => {
    var transformed = {};
    Object.keys(results).forEach((outer) => {
      transformed[outer] = 0.0;
      Object.keys(results).forEach((inner) => {
        if (parseInt(inner) >= parseInt(outer)) {
          transformed[outer] += results[inner];
        }
      });
    });

    return transformed;
  }

  convertToPercentages = (results) => {
    return Object.fromEntries(
      Object.entries(results).map(([key, value]) => [key, (value * 100).toFixed()])
    );
  }

  var htmlHeader = "<thead><tr><th>Min. Damage</th><th>Probability</th></tr></thead>";
  var outputContainer = document.getElementById("output");
  var form = document.querySelector("form");
  var attack, damage, critical, target;
  updateOutput = () => {
    outputContainer.innerHTML = "Calculating ...";

    // Put the rest of the calculation in a timeout, to allow screen to update
    setTimeout(() => {
      attack = parseInt(document.getElementById("attack").value);
      damage = parseInt(document.getElementById("damage").value);
      critical = parseInt(document.getElementById("critical").value);
      target = parseInt(Array.prototype.slice.call(document.querySelectorAll("input[name=target]")).find((x) => x.checked).value);

      var data = convertToPercentages(
        accumulateResults(
          reduceCombinations(
            reduceScenarios(calculateScenarios(attack)),
            probabilityProfile(target),
            damageProfile(damage, critical))));

      var htmlRows = Object.entries(data).map(([damage, probability]) => {
        if (damage == 0) {
          return "";
        }
        if (probability == 0 || probability == 100) {
          probability = "~" + probability;
        }
        return "<tr><th>"+damage+"</th><td>"+probability+"%</td></tr>";
      }).join("\n");

      outputContainer.innerHTML = "<table>" + htmlHeader + "<tbody>" + htmlRows + "</tbody></table>";

      updateHash();
    }, 1);
  }

  updateHash = () => {
    window.location.hash = "a" + attack + "t" + target + "d" + damage + "c" + critical;
  }

  loadFromHash = () => {
    var values = window.location.hash.match(/a(\d)t(\d)d(\d)c(\d)/);
    if (!values) {
      return;
    }

    document.getElementById("attack").value = values[1];
    document.getElementById("damage").value = values[3];
    document.getElementById("critical").value = values[4];
    Array.prototype.slice.call(document.querySelectorAll("input[name=target]")).find((x) => x.value == values[2]).click();
  }


  form.addEventListener("change", (event) => {
    updateOutput();
  });

  document.getElementById("attack").addEventListener("focus", (event) => {
    event.target.select();
  });
  document.getElementById("damage").addEventListener("focus", (event) => {
    event.target.select();
  });
  document.getElementById("critical").addEventListener("focus", (event) => {
    event.target.select();
  });

  loadFromHash();
  updateOutput();
});
