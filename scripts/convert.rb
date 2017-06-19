require 'csv'
require 'date'
require 'time'

CSV.instance(STDOUT) do |out_csv|
  out_csv << %w(timestamp person denomination currency)

  CSV.parse(STDIN.read, headers: true).each do |row|
    row['Count'].to_i.times do
      out_csv << [
        Date.parse(row['Date']).to_time.utc.to_i * 1000,
        row['Person'],
        row['Denomination'],
        row['Currency']
      ]
    end
  end
end
