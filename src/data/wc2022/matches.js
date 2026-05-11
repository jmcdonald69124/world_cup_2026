// World Cup 2022 Qatar — all 64 match results
// Scorelines are actual final results (including after extra time where noted)
// 'pens' field indicates penalty shootout result if applicable

export const WC2022_MATCHES = [
  // ─── GROUP STAGE ──────────────────────────────────────────────────────────────────────────────────

  // Group A
  { id: 'A1', round: 'Group', group: 'A', date: '2022-11-20', home: 'QAT', away: 'ECU', score: { home: 0, away: 2 }, venue: 'Al Bayt Stadium', city: 'Al Khor',
    scorers: [{ team: 'ECU', player: 'Enner Valencia', minute: 16 }, { team: 'ECU', player: 'Enner Valencia', minute: 31 }] },
  { id: 'A2', round: 'Group', group: 'A', date: '2022-11-21', home: 'SEN', away: 'NED', score: { home: 0, away: 2 }, venue: 'Al Thumama Stadium', city: 'Doha',
    scorers: [{ team: 'NED', player: 'Cody Gakpo', minute: 84 }, { team: 'NED', player: 'Davy Klaassen', minute: 90 }] },
  { id: 'A3', round: 'Group', group: 'A', date: '2022-11-25', home: 'QAT', away: 'SEN', score: { home: 1, away: 3 }, venue: 'Al Thumama Stadium', city: 'Doha',
    scorers: [{ team: 'QAT', player: 'Mohammed Muntari', minute: 78 }, { team: 'SEN', player: 'Boulaye Dia', minute: 41 }, { team: 'SEN', player: 'Famara Diedhiou', minute: 48 }, { team: 'SEN', player: 'Bamba Dieng', minute: 84 }] },
  { id: 'A4', round: 'Group', group: 'A', date: '2022-11-25', home: 'NED', away: 'ECU', score: { home: 1, away: 1 }, venue: 'Khalifa International Stadium', city: 'Doha',
    scorers: [{ team: 'ECU', player: 'Enner Valencia', minute: 6 }, { team: 'NED', player: 'Cody Gakpo', minute: 49 }] },
  { id: 'A5', round: 'Group', group: 'A', date: '2022-11-29', home: 'ECU', away: 'SEN', score: { home: 1, away: 2 }, venue: 'Khalifa International Stadium', city: 'Doha',
    scorers: [{ team: 'ECU', player: 'Moisés Caicedo', minute: 67 }, { team: 'SEN', player: 'Ismaïla Sarr', minute: 44 }, { team: 'SEN', player: 'Kalidou Koulibaly', minute: 70 }] },
  { id: 'A6', round: 'Group', group: 'A', date: '2022-11-29', home: 'NED', away: 'QAT', score: { home: 2, away: 0 }, venue: 'Al Bayt Stadium', city: 'Al Khor',
    scorers: [{ team: 'NED', player: 'Cody Gakpo', minute: 26 }, { team: 'NED', player: 'Frenkie de Jong', minute: 49 }] },

  // Group B
  { id: 'B1', round: 'Group', group: 'B', date: '2022-11-21', home: 'ENG', away: 'IRN', score: { home: 6, away: 2 }, venue: 'Khalifa International Stadium', city: 'Doha',
    scorers: [{ team: 'ENG', player: 'Jude Bellingham', minute: 35 }, { team: 'ENG', player: 'Bukayo Saka', minute: 43 }, { team: 'ENG', player: 'Raheem Sterling', minute: 45 }, { team: 'IRN', player: 'Mehdi Taremi', minute: 65 }, { team: 'ENG', player: 'Jack Grealish', minute: 62 }, { team: 'ENG', player: 'Marcus Rashford', minute: 71 }, { team: 'ENG', player: 'Bukayo Saka', minute: 82 }, { team: 'IRN', player: 'Mehdi Taremi', minute: 90 }] },
  { id: 'B2', round: 'Group', group: 'B', date: '2022-11-21', home: 'USA', away: 'WAL', score: { home: 1, away: 1 }, venue: 'Ahmad bin Ali Stadium', city: 'Al Rayyan',
    scorers: [{ team: 'USA', player: 'Timothy Weah', minute: 36 }, { team: 'WAL', player: 'Gareth Bale', minute: 82 }] },
  { id: 'B3', round: 'Group', group: 'B', date: '2022-11-25', home: 'WAL', away: 'IRN', score: { home: 0, away: 2 }, venue: 'Ahmad bin Ali Stadium', city: 'Al Rayyan',
    scorers: [{ team: 'IRN', player: 'Roozbeh Cheshmi', minute: 98 }, { team: 'IRN', player: 'Ramin Rezaeian', minute: 101 }] },
  { id: 'B4', round: 'Group', group: 'B', date: '2022-11-25', home: 'ENG', away: 'USA', score: { home: 0, away: 0 }, venue: 'Al Bayt Stadium', city: 'Al Khor', scorers: [] },
  { id: 'B5', round: 'Group', group: 'B', date: '2022-11-29', home: 'WAL', away: 'ENG', score: { home: 0, away: 3 }, venue: 'Ahmad bin Ali Stadium', city: 'Al Rayyan',
    scorers: [{ team: 'ENG', player: 'Marcus Rashford', minute: 50 }, { team: 'ENG', player: 'Phil Foden', minute: 51 }, { team: 'ENG', player: 'Marcus Rashford', minute: 68 }] },
  { id: 'B6', round: 'Group', group: 'B', date: '2022-11-29', home: 'IRN', away: 'USA', score: { home: 0, away: 1 }, venue: 'Al Thumama Stadium', city: 'Doha',
    scorers: [{ team: 'USA', player: 'Christian Pulisic', minute: 38 }] },

  // Group C
  { id: 'C1', round: 'Group', group: 'C', date: '2022-11-22', home: 'ARG', away: 'KSA', score: { home: 1, away: 2 }, venue: 'Lusail Stadium', city: 'Lusail',
    scorers: [{ team: 'ARG', player: 'Lionel Messi', minute: 10 }, { team: 'KSA', player: 'Saleh Al-Shehri', minute: 48 }, { team: 'KSA', player: 'Salem Al-Dawsari', minute: 53 }] },
  { id: 'C2', round: 'Group', group: 'C', date: '2022-11-22', home: 'MEX', away: 'POL', score: { home: 0, away: 0 }, venue: 'Stadium 974', city: 'Doha', scorers: [] },
  { id: 'C3', round: 'Group', group: 'C', date: '2022-11-26', home: 'POL', away: 'KSA', score: { home: 2, away: 0 }, venue: 'Education City Stadium', city: 'Al Rayyan',
    scorers: [{ team: 'POL', player: 'Piotr Zieliński', minute: 39 }, { team: 'POL', player: 'Robert Lewandowski', minute: 82 }] },
  { id: 'C4', round: 'Group', group: 'C', date: '2022-11-26', home: 'ARG', away: 'MEX', score: { home: 2, away: 0 }, venue: 'Lusail Stadium', city: 'Lusail',
    scorers: [{ team: 'ARG', player: 'Lionel Messi', minute: 64 }, { team: 'ARG', player: 'Enzo Fernández', minute: 87 }] },
  { id: 'C5', round: 'Group', group: 'C', date: '2022-11-30', home: 'POL', away: 'ARG', score: { home: 0, away: 2 }, venue: 'Stadium 974', city: 'Doha',
    scorers: [{ team: 'ARG', player: 'Alexis Mac Allister', minute: 46 }, { team: 'ARG', player: 'Julián Álvarez', minute: 67 }] },
  { id: 'C6', round: 'Group', group: 'C', date: '2022-11-30', home: 'KSA', away: 'MEX', score: { home: 1, away: 2 }, venue: 'Lusail Stadium', city: 'Lusail',
    scorers: [{ team: 'KSA', player: 'Salem Al-Dawsari', minute: 95 }, { team: 'MEX', player: 'Henry Martín', minute: 47 }, { team: 'MEX', player: 'Luis Chávez', minute: 52 }] },

  // Group D
  { id: 'D1', round: 'Group', group: 'D', date: '2022-11-22', home: 'DEN', away: 'TUN', score: { home: 0, away: 0 }, venue: 'Education City Stadium', city: 'Al Rayyan', scorers: [] },
  { id: 'D2', round: 'Group', group: 'D', date: '2022-11-22', home: 'FRA', away: 'AUS', score: { home: 4, away: 1 }, venue: 'Al Janoub Stadium', city: 'Al Wakrah',
    scorers: [{ team: 'AUS', player: 'Craig Goodwin', minute: 9 }, { team: 'FRA', player: 'Adrien Rabiot', minute: 27 }, { team: 'FRA', player: 'Olivier Giroud', minute: 32 }, { team: 'FRA', player: 'Kylian Mbappé', minute: 68 }, { team: 'FRA', player: 'Olivier Giroud', minute: 71 }] },
  { id: 'D3', round: 'Group', group: 'D', date: '2022-11-26', home: 'TUN', away: 'AUS', score: { home: 0, away: 1 }, venue: 'Al Janoub Stadium', city: 'Al Wakrah',
    scorers: [{ team: 'AUS', player: 'Mitchell Duke', minute: 23 }] },
  { id: 'D4', round: 'Group', group: 'D', date: '2022-11-26', home: 'FRA', away: 'DEN', score: { home: 2, away: 1 }, venue: 'Stadium 974', city: 'Doha',
    scorers: [{ team: 'FRA', player: 'Kylian Mbappé', minute: 61 }, { team: 'DEN', player: 'Andreas Christensen', minute: 68 }, { team: 'FRA', player: 'Kylian Mbappé', minute: 86 }] },
  { id: 'D5', round: 'Group', group: 'D', date: '2022-11-30', home: 'AUS', away: 'DEN', score: { home: 1, away: 0 }, venue: 'Al Janoub Stadium', city: 'Al Wakrah',
    scorers: [{ team: 'AUS', player: 'Mathew Leckie', minute: 60 }] },
  { id: 'D6', round: 'Group', group: 'D', date: '2022-11-30', home: 'TUN', away: 'FRA', score: { home: 1, away: 0 }, venue: 'Education City Stadium', city: 'Al Rayyan',
    scorers: [{ team: 'TUN', player: 'Wahbi Khazri', minute: 58 }] },

  // Group E
  { id: 'E1', round: 'Group', group: 'E', date: '2022-11-23', home: 'GER', away: 'JPN', score: { home: 1, away: 2 }, venue: 'Khalifa International Stadium', city: 'Doha',
    scorers: [{ team: 'GER', player: 'Ilkay Gündogan', minute: 33 }, { team: 'JPN', player: 'Ritsu Doan', minute: 75 }, { team: 'JPN', player: 'Takuma Asano', minute: 83 }] },
  { id: 'E2', round: 'Group', group: 'E', date: '2022-11-23', home: 'ESP', away: 'CRC', score: { home: 7, away: 0 }, venue: 'Al Thumama Stadium', city: 'Doha',
    scorers: [{ team: 'ESP', player: 'Dani Olmo', minute: 11 }, { team: 'ESP', player: 'Marco Asensio', minute: 21 }, { team: 'ESP', player: 'Ferran Torres', minute: 31 }, { team: 'ESP', player: 'Ferran Torres', minute: 54 }, { team: 'ESP', player: 'Gavi', minute: 75 }, { team: 'ESP', player: 'Carlos Soler', minute: 90 }, { team: 'ESP', player: 'Morata', minute: 90 }] },
  { id: 'E3', round: 'Group', group: 'E', date: '2022-11-27', home: 'JPN', away: 'CRC', score: { home: 0, away: 1 }, venue: 'Ahmad bin Ali Stadium', city: 'Al Rayyan',
    scorers: [{ team: 'CRC', player: 'Keysher Fuller', minute: 81 }] },
  { id: 'E4', round: 'Group', group: 'E', date: '2022-11-27', home: 'ESP', away: 'GER', score: { home: 1, away: 1 }, venue: 'Al Bayt Stadium', city: 'Al Khor',
    scorers: [{ team: 'ESP', player: 'Álvaro Morata', minute: 62 }, { team: 'GER', player: 'Niclas Füllkrug', minute: 83 }] },
  { id: 'E5', round: 'Group', group: 'E', date: '2022-12-01', home: 'JPN', away: 'ESP', score: { home: 2, away: 1 }, venue: 'Khalifa International Stadium', city: 'Doha',
    scorers: [{ team: 'ESP', player: 'Álvaro Morata', minute: 11 }, { team: 'JPN', player: 'Ritsu Doan', minute: 48 }, { team: 'JPN', player: 'Ao Tanaka', minute: 51 }] },
  { id: 'E6', round: 'Group', group: 'E', date: '2022-12-01', home: 'CRC', away: 'GER', score: { home: 2, away: 4 }, venue: 'Al Bayt Stadium', city: 'Al Khor',
    scorers: [{ team: 'GER', player: 'Serge Gnabry', minute: 10 }, { team: 'CRC', player: 'Juan Pablo Vargas', minute: 58 }, { team: 'GER', player: 'Kai Havertz', minute: 62 }, { team: 'CRC', player: 'Yeltsin Tejeda', minute: 70 }, { team: 'GER', player: 'Kai Havertz', minute: 73 }, { team: 'GER', player: 'Niclas Füllkrug', minute: 89 }] },

  // Group F
  { id: 'F1', round: 'Group', group: 'F', date: '2022-11-23', home: 'MAR', away: 'CRO', score: { home: 0, away: 0 }, venue: 'Al Bayt Stadium', city: 'Al Khor', scorers: [] },
  { id: 'F2', round: 'Group', group: 'F', date: '2022-11-23', home: 'BEL', away: 'CAN', score: { home: 1, away: 0 }, venue: 'Ahmad bin Ali Stadium', city: 'Al Rayyan',
    scorers: [{ team: 'BEL', player: 'Michy Batshuayi', minute: 44 }] },
  { id: 'F3', round: 'Group', group: 'F', date: '2022-11-27', home: 'BEL', away: 'MAR', score: { home: 0, away: 2 }, venue: 'Al Thumama Stadium', city: 'Doha',
    scorers: [{ team: 'MAR', player: 'Romain Saïss', minute: 70 }, { team: 'MAR', player: 'Zakaria Aboukhlal', minute: 90 }] },
  { id: 'F4', round: 'Group', group: 'F', date: '2022-11-27', home: 'CRO', away: 'CAN', score: { home: 4, away: 1 }, venue: 'Khalifa International Stadium', city: 'Doha',
    scorers: [{ team: 'CAN', player: 'Alphonso Davies', minute: 2 }, { team: 'CRO', player: 'Andrej Kramаrić', minute: 36 }, { team: 'CRO', player: 'Marko Livaja', minute: 44 }, { team: 'CRO', player: 'Lovro Majer', minute: 70 }, { team: 'CRO', player: 'Andrej Kramаrić', minute: 74 }] },
  { id: 'F5', round: 'Group', group: 'F', date: '2022-12-01', home: 'CRO', away: 'BEL', score: { home: 0, away: 0 }, venue: 'Ahmad bin Ali Stadium', city: 'Al Rayyan', scorers: [] },
  { id: 'F6', round: 'Group', group: 'F', date: '2022-12-01', home: 'CAN', away: 'MAR', score: { home: 1, away: 2 }, venue: 'Al Thumama Stadium', city: 'Doha',
    scorers: [{ team: 'MAR', player: 'Hakim Ziyech', minute: 4 }, { team: 'MAR', player: 'Youssef En-Nesyri', minute: 23 }, { team: 'CAN', player: 'Nayef Aguerd (OG)', minute: 40 }] },

  // Group G
  { id: 'G1', round: 'Group', group: 'G', date: '2022-11-24', home: 'SUI', away: 'CMR', score: { home: 1, away: 0 }, venue: 'Al Janoub Stadium', city: 'Al Wakrah',
    scorers: [{ team: 'SUI', player: 'Breel Embolo', minute: 48 }] },
  { id: 'G2', round: 'Group', group: 'G', date: '2022-11-24', home: 'BRA', away: 'SRB', score: { home: 2, away: 0 }, venue: 'Lusail Stadium', city: 'Lusail',
    scorers: [{ team: 'BRA', player: 'Richarlison', minute: 62 }, { team: 'BRA', player: 'Richarlison', minute: 73 }] },
  { id: 'G3', round: 'Group', group: 'G', date: '2022-11-28', home: 'CMR', away: 'SRB', score: { home: 3, away: 3 }, venue: 'Al Janoub Stadium', city: 'Al Wakrah',
    scorers: [{ team: 'SRB', player: 'Strahinja Pavlović', minute: 26 }, { team: 'CMR', player: 'Jean-Charles Castelletto', minute: 29 }, { team: 'SRB', player: 'Sergej Milinković-Savić', minute: 44 }, { team: 'CMR', player: 'Vincent Aboubakar', minute: 63 }, { team: 'CMR', player: 'Eric Maxim Choupo-Moting', minute: 66 }, { team: 'SRB', player: 'Luka Jović', minute: 90 }] },
  { id: 'G4', round: 'Group', group: 'G', date: '2022-11-28', home: 'BRA', away: 'SUI', score: { home: 1, away: 0 }, venue: 'Stadium 974', city: 'Doha',
    scorers: [{ team: 'BRA', player: 'Casemiro', minute: 83 }] },
  { id: 'G5', round: 'Group', group: 'G', date: '2022-12-02', home: 'SRB', away: 'SUI', score: { home: 2, away: 3 }, venue: 'Stadium 974', city: 'Doha',
    scorers: [{ team: 'SUI', player: 'Xherdan Shaqiri', minute: 20 }, { team: 'SRB', player: 'Aleksandar Mitrović', minute: 26 }, { team: 'SRB', player: 'Dušan Tadic', minute: 35 }, { team: 'SUI', player: 'Breel Embolo', minute: 44 }, { team: 'SUI', player: 'Remo Freuler', minute: 48 }] },
  { id: 'G6', round: 'Group', group: 'G', date: '2022-12-02', home: 'CMR', away: 'BRA', score: { home: 1, away: 0 }, venue: 'Lusail Stadium', city: 'Lusail',
    scorers: [{ team: 'CMR', player: 'Vincent Aboubakar', minute: 92 }] },

  // Group H
  { id: 'H1', round: 'Group', group: 'H', date: '2022-11-24', home: 'URU', away: 'KOR', score: { home: 0, away: 0 }, venue: 'Education City Stadium', city: 'Al Rayyan', scorers: [] },
  { id: 'H2', round: 'Group', group: 'H', date: '2022-11-24', home: 'POR', away: 'GHA', score: { home: 3, away: 2 }, venue: 'Stadium 974', city: 'Doha',
    scorers: [{ team: 'POR', player: 'Cristiano Ronaldo', minute: 65 }, { team: 'GHA', player: 'André Ayew', minute: 73 }, { team: 'POR', player: 'João Félix', minute: 78 }, { team: 'POR', player: 'Rafael Leão', minute: 80 }, { team: 'GHA', player: 'Osman Bukari', minute: 89 }] },
  { id: 'H3', round: 'Group', group: 'H', date: '2022-11-28', home: 'KOR', away: 'GHA', score: { home: 2, away: 3 }, venue: 'Education City Stadium', city: 'Al Rayyan',
    scorers: [{ team: 'GHA', player: 'André Ayew', minute: 24 }, { team: 'GHA', player: 'Mohammed Kudus', minute: 34 }, { team: 'KOR', player: 'Cho Gue-sung', minute: 58 }, { team: 'KOR', player: 'Cho Gue-sung', minute: 61 }, { team: 'GHA', player: 'Mohammed Kudus', minute: 68 }] },
  { id: 'H4', round: 'Group', group: 'H', date: '2022-11-28', home: 'POR', away: 'URU', score: { home: 2, away: 0 }, venue: 'Lusail Stadium', city: 'Lusail',
    scorers: [{ team: 'POR', player: 'Bruno Fernandes', minute: 54 }, { team: 'POR', player: 'Bruno Fernandes', minute: 90 }] },
  { id: 'H5', round: 'Group', group: 'H', date: '2022-12-02', home: 'GHA', away: 'URU', score: { home: 0, away: 2 }, venue: 'Al Janoub Stadium', city: 'Al Wakrah',
    scorers: [{ team: 'URU', player: 'Giorgian de Arrascaeta', minute: 26 }, { team: 'URU', player: 'Giorgian de Arrascaeta', minute: 32 }] },
  { id: 'H6', round: 'Group', group: 'H', date: '2022-12-02', home: 'KOR', away: 'POR', score: { home: 2, away: 1 }, venue: 'Education City Stadium', city: 'Al Rayyan',
    scorers: [{ team: 'POR', player: 'Ricardo Horta', minute: 7 }, { team: 'KOR', player: 'Kim Young-gwon', minute: 27 }, { team: 'KOR', player: 'Hwang Hee-chan', minute: 90 }] },

  // ─── ROUND OF 16 ──────────────────────────────────────────────────────────────────────────

  { id: 'R16_1', round: 'Round of 16', group: null, date: '2022-12-03', home: 'NED', away: 'USA', score: { home: 3, away: 1 }, venue: 'Khalifa International Stadium', city: 'Doha',
    scorers: [{ team: 'NED', player: 'Memphis Depay', minute: 10 }, { team: 'NED', player: 'Daley Blind', minute: 45 }, { team: 'USA', player: 'Haji Wright', minute: 76 }, { team: 'NED', player: 'Denzel Dumfries', minute: 81 }] },
  { id: 'R16_2', round: 'Round of 16', group: null, date: '2022-12-03', home: 'ARG', away: 'AUS', score: { home: 2, away: 1 }, venue: 'Ahmad bin Ali Stadium', city: 'Al Rayyan',
    scorers: [{ team: 'ARG', player: 'Lionel Messi', minute: 35 }, { team: 'ARG', player: 'Julián Álvarez', minute: 57 }, { team: 'AUS', player: 'Craig Goodwin', minute: 77 }] },
  { id: 'R16_3', round: 'Round of 16', group: null, date: '2022-12-04', home: 'FRA', away: 'POL', score: { home: 3, away: 1 }, venue: 'Al Thumama Stadium', city: 'Doha',
    scorers: [{ team: 'FRA', player: 'Olivier Giroud', minute: 44 }, { team: 'FRA', player: 'Kylian Mbappé', minute: 74 }, { team: 'FRA', player: 'Kylian Mbappé', minute: 91 }, { team: 'POL', player: 'Robert Lewandowski', minute: 99 }] },
  { id: 'R16_4', round: 'Round of 16', group: null, date: '2022-12-04', home: 'ENG', away: 'SEN', score: { home: 3, away: 0 }, venue: 'Al Bayt Stadium', city: 'Al Khor',
    scorers: [{ team: 'ENG', player: 'Jordan Henderson', minute: 38 }, { team: 'ENG', player: 'Harry Kane', minute: 45 }, { team: 'ENG', player: 'Bukayo Saka', minute: 57 }] },
  { id: 'R16_5', round: 'Round of 16', group: null, date: '2022-12-05', home: 'JPN', away: 'CRO', score: { home: 1, away: 1 }, pens: { home: 1, away: 3 }, venue: 'Al Janoub Stadium', city: 'Al Wakrah',
    scorers: [{ team: 'JPN', player: 'Daizen Maeda', minute: 43 }, { team: 'CRO', player: 'Ivan Perišić', minute: 55 }] },
  { id: 'R16_6', round: 'Round of 16', group: null, date: '2022-12-05', home: 'BRA', away: 'KOR', score: { home: 4, away: 1 }, venue: 'Stadium 974', city: 'Doha',
    scorers: [{ team: 'BRA', player: 'Vinícius Júnior', minute: 7 }, { team: 'BRA', player: 'Neymar', minute: 13 }, { team: 'BRA', player: 'Richarlison', minute: 29 }, { team: 'BRA', player: 'Lucas Paquetá', minute: 36 }, { team: 'KOR', player: 'Baek Seung-ho', minute: 76 }] },
  { id: 'R16_7', round: 'Round of 16', group: null, date: '2022-12-06', home: 'MAR', away: 'ESP', score: { home: 0, away: 0 }, pens: { home: 3, away: 0 }, venue: 'Education City Stadium', city: 'Al Rayyan', scorers: [] },
  { id: 'R16_8', round: 'Round of 16', group: null, date: '2022-12-06', home: 'POR', away: 'SUI', score: { home: 6, away: 1 }, venue: 'Lusail Stadium', city: 'Lusail',
    scorers: [{ team: 'POR', player: 'Goncalo Ramos', minute: 17 }, { team: 'POR', player: 'Pepe', minute: 33 }, { team: 'POR', player: 'Goncalo Ramos', minute: 51 }, { team: 'POR', player: 'Goncalo Ramos', minute: 55 }, { team: 'SUI', player: 'Manuel Akanji', minute: 58 }, { team: 'POR', player: 'Raphaël Guerreiro', minute: 55 }, { team: 'POR', player: 'Rafael Leão', minute: 90 }] },

  // ─── QUARTERFINALS ───────────────────────────────────────────────────────────────────────────────

  { id: 'QF1', round: 'Quarterfinals', group: null, date: '2022-12-09', home: 'NED', away: 'ARG', score: { home: 2, away: 2 }, pens: { home: 3, away: 4 }, venue: 'Lusail Stadium', city: 'Lusail',
    scorers: [{ team: 'ARG', player: 'Nahuel Molina', minute: 35 }, { team: 'ARG', player: 'Lionel Messi', minute: 73 }, { team: 'NED', player: 'Wout Weghorst', minute: 83 }, { team: 'NED', player: 'Wout Weghorst', minute: 90 }] },
  { id: 'QF2', round: 'Quarterfinals', group: null, date: '2022-12-09', home: 'CRO', away: 'BRA', score: { home: 1, away: 1 }, pens: { home: 4, away: 2 }, venue: 'Education City Stadium', city: 'Al Rayyan',
    scorers: [{ team: 'BRA', player: 'Neymar', minute: 105 }, { team: 'CRO', player: 'Bruno Petković', minute: 117 }] },
  { id: 'QF3', round: 'Quarterfinals', group: null, date: '2022-12-10', home: 'MAR', away: 'POR', score: { home: 1, away: 0 }, venue: 'Al Thumama Stadium', city: 'Doha',
    scorers: [{ team: 'MAR', player: 'Youssef En-Nesyri', minute: 42 }] },
  { id: 'QF4', round: 'Quarterfinals', group: null, date: '2022-12-10', home: 'ENG', away: 'FRA', score: { home: 1, away: 2 }, venue: 'Al Bayt Stadium', city: 'Al Khor',
    scorers: [{ team: 'FRA', player: 'Aurélien Tchouaméni', minute: 17 }, { team: 'ENG', player: 'Bukayo Saka', minute: 50 }, { team: 'FRA', player: 'Olivier Giroud', minute: 78 }] },

  // ─── SEMIFINALS ──────────────────────────────────────────────────────────────────────────────────

  { id: 'SF1', round: 'Semifinals', group: null, date: '2022-12-13', home: 'ARG', away: 'CRO', score: { home: 3, away: 0 }, venue: 'Lusail Stadium', city: 'Lusail',
    scorers: [{ team: 'ARG', player: 'Lionel Messi', minute: 34 }, { team: 'ARG', player: 'Julián Álvarez', minute: 39 }, { team: 'ARG', player: 'Julián Álvarez', minute: 69 }] },
  { id: 'SF2', round: 'Semifinals', group: null, date: '2022-12-14', home: 'FRA', away: 'MAR', score: { home: 2, away: 0 }, venue: 'Al Bayt Stadium', city: 'Al Khor',
    scorers: [{ team: 'FRA', player: 'Théo Hernández', minute: 5 }, { team: 'FRA', player: 'Randal Kolo Muani', minute: 79 }] },

  // ─── THIRD PLACE ────────────────────────────────────────────────────────────────────────────────

  { id: 'TP', round: '3rd Place', group: null, date: '2022-12-17', home: 'CRO', away: 'MAR', score: { home: 2, away: 1 }, venue: 'Khalifa International Stadium', city: 'Doha',
    scorers: [{ team: 'CRO', player: 'Joško Gvardiol', minute: 7 }, { team: 'MAR', player: 'Achraf Dari', minute: 9 }, { team: 'CRO', player: 'Mislav Oršić', minute: 42 }] },

  // ─── FINAL ─────────────────────────────────────────────────────────────────────────────────────

  { id: 'FIN', round: 'Final', group: null, date: '2022-12-18', home: 'ARG', away: 'FRA', score: { home: 3, away: 3 }, pens: { home: 4, away: 2 }, venue: 'Lusail Stadium', city: 'Lusail',
    scorers: [
      { team: 'ARG', player: 'Lionel Messi', minute: 23 },
      { team: 'ARG', player: 'Ángel Di María', minute: 36 },
      { team: 'FRA', player: 'Kylian Mbappé', minute: 80 },
      { team: 'FRA', player: 'Kylian Mbappé', minute: 81 },
      { team: 'ARG', player: 'Lionel Messi', minute: 108 },
      { team: 'FRA', player: 'Kylian Mbappé', minute: 118 },
    ] },
];

export const WC2022_TOURNAMENT = {
  name: 'FIFA World Cup Qatar 2022',
  host: 'Qatar',
  startDate: '2022-11-20',
  endDate: '2022-12-18',
  teams: 32,
  matches: 64,
  totalGoals: 172,
  avgGoalsPerMatch: 2.69,
  champion: 'ARG',
  runnerUp: 'FRA',
  thirdPlace: 'CRO',
  fourthPlace: 'MAR',
  goldenBall: { player: 'Lionel Messi', team: 'ARG' },
  goldenBoot: { player: 'Kylian Mbappé', team: 'FRA', goals: 8 },
  goldenGlove: { player: 'Emiliano Martínez', team: 'ARG' },
};
