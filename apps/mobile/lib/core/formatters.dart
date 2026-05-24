import 'package:intl/intl.dart';

final _dateFormatter = DateFormat('dd MMM yyyy');
final _dateTimeFormatter = DateFormat('dd MMM HH:mm');
final _monthFormatter = DateFormat('MMMM yyyy');
final _moneyFormatter = NumberFormat.currency(symbol: 'RON', decimalDigits: 0);
final _preciseMoneyFormatter = NumberFormat.currency(symbol: 'RON', decimalDigits: 2);

String formatDate(String? value) {
  if (value == null || value.isEmpty) return 'Pending';
  final date = DateTime.tryParse(value);
  if (date == null) return 'Invalid date';
  return _dateFormatter.format(date.toLocal());
}

String formatDateTime(String? value) {
  if (value == null || value.isEmpty) return 'Open';
  final date = DateTime.tryParse(value);
  if (date == null) return 'Invalid date';
  return _dateTimeFormatter.format(date.toLocal());
}

String formatMonthLabel(int year, int month) {
  return _monthFormatter.format(DateTime(year, month));
}

String formatHours(num? value) {
  if (value == null) return '0h';
  return '${value.ceil()}h';
}

String formatMoney(num? value, {bool precise = false}) {
  if (value == null) return 'Not set';
  return (precise ? _preciseMoneyFormatter : _moneyFormatter).format(value);
}

String formatFileSize(num? value) {
  if (value == null) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  var size = value.toDouble();
  var index = 0;
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }
  final digits = index == 0 ? 0 : 1;
  return '${size.toStringAsFixed(digits)} ${units[index]}';
}

String currentPeriod() {
  final now = DateTime.now();
  return '${now.year}-${now.month.toString().padLeft(2, '0')}';
}

(int, int) parsePeriod(String period) {
  final parts = period.split('-');
  if (parts.length != 2) {
    final now = DateTime.now();
    return (now.year, now.month);
  }
  final year = int.tryParse(parts[0]);
  final month = int.tryParse(parts[1]);
  if (year == null || month == null || month < 1 || month > 12) {
    final now = DateTime.now();
    return (now.year, now.month);
  }
  return (year, month);
}

({String from, String to}) monthBounds(String period) {
  final (year, month) = parsePeriod(period);
  final lastDay = DateTime(year, month + 1, 0).day;
  final paddedMonth = month.toString().padLeft(2, '0');
  return (
    from: '$year-$paddedMonth-01',
    to: '$year-$paddedMonth-${lastDay.toString().padLeft(2, '0')}',
  );
}

String periodAfter(String period, int deltaMonths) {
  final (year, month) = parsePeriod(period);
  final next = DateTime(year, month + deltaMonths);
  return '${next.year}-${next.month.toString().padLeft(2, '0')}';
}

