using Microsoft.VisualBasic;

public class ComplexViewModel
{
  public int Id { get; set; }
  public string Name { get; set; }
  public int? IdDepartment { get; set; }
  public List<SimpleViewModel> Items { get; set; }
  public List<string> Roles { get; set; }
  public DateTime CreatedAt { get; set; }
  public Dictionary<int, string> Pairs { get; set; }
}
