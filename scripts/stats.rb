require 'optparse'
require 'csv'
require 'time'
require 'pp'

def num_days(rows)
  rows.group_by { |r| r['t'].yday }.count
end

def longest_streak(rows, range:)
  by_day = rows.group_by { |r| r['t'].to_date }

  longest_streak_start = nil
  longest_streak_len = 0
  longest_streak_count = 0
  streak_start = nil
  streak_len = 0
  streak_count = 0

  range.each do |date|
    if (day_items = by_day[date])
      if streak_start
        streak_len += 1
        streak_count += day_items.count
      else
        streak_start = date
        streak_count = day_items.count
      end
    else
      if streak_start && streak_len > longest_streak_len
        longest_streak_len = streak_len
        longest_streak_start = streak_start
        longest_streak_count = streak_count
      end

      streak_len = 0
      streak_start = nil
      streak_count = 0
    end
  end

  {
    streak_start: longest_streak_start,
    streak_len: longest_streak_len,
    streak_count: longest_streak_count,
  }
end

def top_coins(rows)
  rows.
    group_by { |r| [ r['denomination'], r['currency'] ].join(' ') }.
    sort_by { |coin, rows| -rows.count }.
    map { |coin, rows| [ coin, rows.count ] }.
    to_h
end

def best_day_count(rows)
  date, items = rows.group_by { |r| r['t'].to_date }.max_by { |k, v| v.size }

  {
    date: date,
    count: items.count,
    sum: items.group_by { |r| r['currency'] }.map do |currency, rows|
      amt = rows.reduce(0) { |acc, r| r['denomination'].to_f + acc }.round(3)
      [currency, amt]
    end,
  }
end

def process(stdin)
  csv = CSV.new(stdin, headers: true).to_a

  csv.each do |row|
    row['t'] = Time.at(row['timestamp'].to_i / 1000)
  end

  filtered = csv.select do |row|
    row['person'] == 'Zach' && row['t'].year == 2021
  end

  stats = {
    num_days: num_days(filtered),
    longest_streak: longest_streak(filtered, range: Date.new(2021, 1, 1)..Date.new(2021, 12, 31)),
    best_day_count: best_day_count(filtered),
    top_coins: top_coins(filtered),
  }

  pp stats
end

if $PROGRAM_NAME == __FILE__
  process(STDIN)
end